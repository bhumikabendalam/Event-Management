package com.bits.event_management.service;

import com.bits.event_management.dto.*;
import com.bits.event_management.exception.BadRequestException;
import com.bits.event_management.exception.ResourceNotFoundException;
import com.bits.event_management.model.*;
import com.bits.event_management.repository.*;
import com.bits.event_management.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;

    public RegistrationService(RegistrationRepository registrationRepository,
                               EventRepository eventRepository,
                               UserRepository userRepository,
                               TicketRepository ticketRepository,
                               NotificationRepository notificationRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public RegistrationResponse registerForEvent(RegistrationRequest request) {
        User user = getCurrentUserEntity();
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BadRequestException("You can only register for PUBLISHED events");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(event.getEndDate())) {
            throw new BadRequestException("This event has already ended");
        }
        if (now.isAfter(event.getStartDate().minusMinutes(30))) {
            throw new BadRequestException("Bookings for this event are closed (bookings stop 30 minutes before start time)");
        }

        if (event.getAvailableSeats() < request.getTicketQuantity()) {
            throw new BadRequestException("Not enough available seats. Only " + event.getAvailableSeats() + " left.");
        }

        // Allow multiple registrations for the same event (e.g., booking for other people or multiple times)
        /*
        boolean alreadyRegistered = registrationRepository.existsByEventIdAndUserIdAndStatusNot(
                event.getId(), user.getId(), RegistrationStatus.CANCELLED
        );
        if (alreadyRegistered) {
            throw new BadRequestException("You have already registered for this event");
        }
        */

        event.setAvailableSeats(event.getAvailableSeats() - request.getTicketQuantity());
        eventRepository.save(event);

        BigDecimal totalPrice = event.getPrice().multiply(BigDecimal.valueOf(request.getTicketQuantity()));
        
        String paymentStatus = "COMPLETED";
        String paymentId = "PAY-MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Registration registration = Registration.builder()
                .event(event)
                .user(user)
                .status(RegistrationStatus.CONFIRMED)
                .ticketQuantity(request.getTicketQuantity())
                .totalPrice(totalPrice)
                .paymentStatus(paymentStatus)
                .paymentId(paymentId)
                .build();

        Registration savedRegistration = registrationRepository.save(registration);

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < request.getTicketQuantity(); i++) {
            String attendeeName = user.getName();
            String attendeeEmail = user.getEmail();

            if (request.getAttendees() != null && i < request.getAttendees().size()) {
                RegistrationRequest.AttendeeInfo info = request.getAttendees().get(i);
                if (info.getName() != null && !info.getName().trim().isEmpty()) {
                    attendeeName = info.getName();
                }
                if (info.getEmail() != null && !info.getEmail().trim().isEmpty()) {
                    attendeeEmail = info.getEmail();
                }
            }

            String ticketNumber = "TKT-" + event.getId() + "-" + (System.currentTimeMillis() % 1000000) + "-" + (i + 1);

            Ticket ticket = Ticket.builder()
                    .ticketNumber(ticketNumber)
                    .registration(savedRegistration)
                    .event(event)
                    .attendeeName(attendeeName)
                    .attendeeEmail(attendeeEmail)
                    .isCheckedIn(false)
                    .build();

            tickets.add(ticketRepository.save(ticket));
        }

        Notification notification = Notification.builder()
                .user(user)
                .title("Registration Confirmed")
                .message("Your registration for '" + event.getTitle() + "' was successful. Ticket quantity: " + request.getTicketQuantity())
                .type(NotificationType.EVENT_REGISTRATION)
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        return mapToRegistrationResponse(savedRegistration, tickets);
    }

    public PageResponse<RegistrationResponse> getMyRegistrations(int page, int size) {
        User user = getCurrentUserEntity();
        Pageable pageable = PageRequest.of(page, size, Sort.by("registrationDate").descending());
        
        Page<Registration> registrations = registrationRepository.findByUserId(user.getId(), pageable);
        Page<RegistrationResponse> responsePage = registrations.map(reg -> {
            List<Ticket> tickets = ticketRepository.findByRegistrationId(reg.getId());
            return mapToRegistrationResponse(reg, tickets);
        });

        return PageResponse.fromPage(responsePage);
    }

    public PageResponse<RegistrationResponse> getEventRegistrations(Long eventId, int page, int size) {
        User currentUser = getCurrentUserEntity();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You do not have permission to view registrations for this event");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("registrationDate").descending());
        Page<Registration> registrations = registrationRepository.findByEventId(eventId, pageable);
        
        Page<RegistrationResponse> responsePage = registrations.map(reg -> {
            List<Ticket> tickets = ticketRepository.findByRegistrationId(reg.getId());
            return mapToRegistrationResponse(reg, tickets);
        });

        return PageResponse.fromPage(responsePage);
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

    private RegistrationResponse mapToRegistrationResponse(Registration reg, List<Ticket> tickets) {
        List<TicketResponse> ticketResponses = tickets.stream()
                .map(t -> TicketResponse.builder()
                        .id(t.getId())
                        .ticketNumber(t.getTicketNumber())
                        .eventId(t.getEvent().getId())
                        .eventTitle(t.getEvent().getTitle())
                        .attendeeName(t.getAttendeeName())
                        .attendeeEmail(t.getAttendeeEmail())
                        .isCheckedIn(t.getIsCheckedIn())
                        .checkedInAt(t.getCheckedInAt())
                        .build())
                .collect(Collectors.toList());

        return RegistrationResponse.builder()
                .id(reg.getId())
                .eventId(reg.getEvent().getId())
                .eventTitle(reg.getEvent().getTitle())
                .eventDate(reg.getEvent().getStartDate())
                .eventVenue(reg.getEvent().getLocation())
                .eventImage(reg.getEvent().getImageUrl())
                .category(reg.getEvent().getCategory() != null ? reg.getEvent().getCategory().getName() : "")
                .userId(reg.getUser().getId())
                .userName(reg.getUser().getName())
                .userEmail(reg.getUser().getEmail())
                .organizerEmail(reg.getEvent().getOrganizer().getEmail())
                .registrationDate(reg.getRegistrationDate())
                .status(reg.getStatus().name())
                .ticketQuantity(reg.getTicketQuantity())
                .totalPrice(reg.getTotalPrice())
                .paymentStatus(reg.getPaymentStatus())
                .paymentId(reg.getPaymentId())
                .tickets(ticketResponses)
                .build();
    }
}
