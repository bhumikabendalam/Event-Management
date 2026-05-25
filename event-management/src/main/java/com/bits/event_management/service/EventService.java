package com.bits.event_management.service;

import com.bits.event_management.dto.EventRequest;
import com.bits.event_management.dto.EventResponse;
import com.bits.event_management.dto.PageResponse;
import com.bits.event_management.exception.BadRequestException;
import com.bits.event_management.exception.ResourceNotFoundException;
import com.bits.event_management.model.*;
import com.bits.event_management.repository.CategoryRepository;
import com.bits.event_management.repository.EventRepository;
import com.bits.event_management.repository.ReviewRepository;
import com.bits.event_management.repository.UserRepository;
import com.bits.event_management.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository,
                        CategoryRepository categoryRepository,
                        ReviewRepository reviewRepository,
                        UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    public PageResponse<EventResponse> getEvents(int page, int size, Long categoryId, String title, String statusStr) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startDate").ascending());
        
        EventStatus status = EventStatus.PUBLISHED;
        if (statusStr != null && !statusStr.trim().isEmpty()) {
            try {
                status = EventStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid event status: " + statusStr);
            }
        }

        Page<Event> eventPage;
        if (title != null && !title.trim().isEmpty() && categoryId != null) {
            eventPage = eventRepository.findByTitleContainingIgnoreCaseAndCategoryIdAndStatus(title, categoryId, status, pageable);
        } else if (title != null && !title.trim().isEmpty()) {
            eventPage = eventRepository.findByTitleContainingIgnoreCaseAndStatus(title, status, pageable);
        } else if (categoryId != null) {
            eventPage = eventRepository.findByCategoryIdAndStatus(categoryId, status, pageable);
        } else {
            eventPage = eventRepository.findByStatus(status, pageable);
        }

        Page<EventResponse> responsePage = eventPage.map(this::mapToEventResponse);
        return PageResponse.fromPage(responsePage);
    }

    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToEventResponse(event);
    }

    @Transactional
    public EventResponse createEvent(EventRequest request) {
        User organizer = getCurrentUserEntity();
        
        if (organizer.getRole() != Role.ROLE_ORGANIZER && organizer.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Only organizers or admins can create events");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Event start date must be in the future");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Event end date must be after the start date");
        }

        EventStatus status = EventStatus.DRAFT;
        if (request.getStatus() != null) {
            try {
                status = EventStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .price(request.getPrice())
                .capacity(request.getCapacity())
                .availableSeats(request.getCapacity())
                .status(status)
                .imageUrl(request.getImageUrl())
                .category(category)
                .organizer(organizer)
                .build();

        Event savedEvent = eventRepository.save(event);
        return mapToEventResponse(savedEvent);
    }

    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        User currentUser = getCurrentUserEntity();
        
        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You do not have permission to update this event");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Event end date must be after the start date");
        }

        int oldCapacity = event.getCapacity();
        int newCapacity = request.getCapacity();
        int bookedSeats = oldCapacity - event.getAvailableSeats();
        if (newCapacity < bookedSeats) {
            throw new BadRequestException("Cannot reduce capacity below currently booked seats: " + bookedSeats);
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setPrice(request.getPrice());
        event.setCapacity(newCapacity);
        event.setAvailableSeats(newCapacity - bookedSeats);
        event.setImageUrl(request.getImageUrl());
        event.setCategory(category);

        if (request.getStatus() != null) {
            try {
                event.setStatus(EventStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + request.getStatus());
            }
        }

        Event updatedEvent = eventRepository.save(event);
        return mapToEventResponse(updatedEvent);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        User currentUser = getCurrentUserEntity();
        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You do not have permission to delete this event");
        }

        eventRepository.delete(event);
    }

    private User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new BadRequestException("User not authenticated");
        }
        User principalUser = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        return userRepository.findById(principalUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found in database"));
    }

    public EventResponse mapToEventResponse(Event event) {
        Double avgRating = reviewRepository.findAverageRatingByEventId(event.getId());
        
        // Calculate dynamic status based on time constraints
        String status = event.getStatus().name();
        LocalDateTime now = LocalDateTime.now();
        if (event.getStatus() == EventStatus.PUBLISHED) {
            if (now.isAfter(event.getEndDate())) {
                status = "ENDED";
            } else if (now.isAfter(event.getStartDate().minusMinutes(30))) {
                status = "CLOSED";
            }
        } else if (event.getStatus() == EventStatus.COMPLETED) {
            status = "ENDED";
        }

        // Calculate dynamic duration string
        String durationStr = "";
        if (event.getStartDate() != null && event.getEndDate() != null) {
            long durationMinutes = java.time.Duration.between(event.getStartDate(), event.getEndDate()).toMinutes();
            long hours = durationMinutes / 60;
            long mins = durationMinutes % 60;
            durationStr = hours > 0 
                    ? (mins > 0 ? hours + " hr " + mins + " mins" : hours + " hr" + (hours > 1 ? "s" : ""))
                    : mins + " mins";
        }

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .price(event.getPrice())
                .capacity(event.getCapacity())
                .availableSeats(event.getAvailableSeats())
                .status(status)
                .imageUrl(event.getImageUrl())
                .categoryId(event.getCategory().getId())
                .categoryName(event.getCategory().getName())
                .organizerId(event.getOrganizer().getId())
                .organizerName(event.getOrganizer().getName())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .duration(durationStr)
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
