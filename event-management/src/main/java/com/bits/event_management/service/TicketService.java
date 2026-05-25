package com.bits.event_management.service;

import com.bits.event_management.dto.PageResponse;
import com.bits.event_management.dto.TicketResponse;
import com.bits.event_management.exception.BadRequestException;
import com.bits.event_management.exception.ResourceNotFoundException;
import com.bits.event_management.model.Role;
import com.bits.event_management.model.Ticket;
import com.bits.event_management.model.User;
import com.bits.event_management.repository.TicketRepository;
import com.bits.event_management.repository.UserRepository;
import com.bits.event_management.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User currentUser = getCurrentUserEntity();

        boolean isBuyer = ticket.getRegistration().getUser().getId().equals(currentUser.getId());
        boolean isAttendee = ticket.getAttendeeEmail().equalsIgnoreCase(currentUser.getEmail());
        boolean isOrganizer = ticket.getEvent().getOrganizer().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isBuyer && !isAttendee && !isOrganizer && !isAdmin) {
            throw new BadRequestException("You do not have permission to view this ticket");
        }

        return mapToTicketResponse(ticket);
    }

    public PageResponse<TicketResponse> getMyTickets(int page, int size) {
        User user = getCurrentUserEntity();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Ticket> tickets = ticketRepository.findByRegistrationUserId(user.getId(), pageable);
        return PageResponse.fromPage(tickets.map(this::mapToTicketResponse));
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

    private TicketResponse mapToTicketResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .eventId(t.getEvent().getId())
                .eventTitle(t.getEvent().getTitle())
                .attendeeName(t.getAttendeeName())
                .attendeeEmail(t.getAttendeeEmail())
                .isCheckedIn(t.getIsCheckedIn())
                .checkedInAt(t.getCheckedInAt())
                .build();
    }
}
