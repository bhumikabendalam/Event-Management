package com.bits.event_management.service;

import com.bits.event_management.dto.DashboardMetrics;
import com.bits.event_management.exception.BadRequestException;
import com.bits.event_management.exception.ResourceNotFoundException;
import com.bits.event_management.model.EventStatus;
import com.bits.event_management.model.Role;
import com.bits.event_management.model.User;
import com.bits.event_management.repository.EventRepository;
import com.bits.event_management.repository.RegistrationRepository;
import com.bits.event_management.repository.UserRepository;
import com.bits.event_management.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    public AnalyticsService(EventRepository eventRepository,
                            RegistrationRepository registrationRepository,
                            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
    }

    public DashboardMetrics getDashboardMetrics() {
        User user = getCurrentUserEntity();

        if (user.getRole() == Role.ROLE_ADMIN) {
            long totalEvents = eventRepository.count();
            long activeEvents = eventRepository.countByStatus(EventStatus.PUBLISHED);
            long totalRegs = registrationRepository.count();
            long ticketsSold = registrationRepository.countTotalTicketsSold();
            double totalRevenue = registrationRepository.sumTotalRevenue();
            long totalUsers = userRepository.count();

            return DashboardMetrics.builder()
                    .totalEvents(totalEvents)
                    .activeEvents(activeEvents)
                    .totalRegistrations(totalRegs)
                    .ticketsSold(ticketsSold)
                    .totalRevenue(totalRevenue)
                    .totalUsers(totalUsers)
                    .build();
        } else if (user.getRole() == Role.ROLE_ORGANIZER) {
            long totalEvents = eventRepository.countByOrganizerId(user.getId());
            long activeEvents = eventRepository.countByOrganizerIdAndStatus(user.getId(), EventStatus.PUBLISHED);
            long totalRegs = registrationRepository.countByEventOrganizerId(user.getId());
            long ticketsSold = registrationRepository.countTicketsSoldByOrganizer(user.getId());
            double totalRevenue = registrationRepository.sumRevenueByOrganizer(user.getId());

            return DashboardMetrics.builder()
                    .totalEvents(totalEvents)
                    .activeEvents(activeEvents)
                    .totalRegistrations(totalRegs)
                    .ticketsSold(ticketsSold)
                    .totalRevenue(totalRevenue)
                    .totalUsers(0)
                    .build();
        } else {
            throw new BadRequestException("You do not have permission to view dashboard analytics");
        }
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
}
