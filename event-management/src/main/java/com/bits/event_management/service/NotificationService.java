package com.bits.event_management.service;

import com.bits.event_management.dto.NotificationResponse;
import com.bits.event_management.dto.PageResponse;
import com.bits.event_management.exception.BadRequestException;
import com.bits.event_management.exception.ResourceNotFoundException;
import com.bits.event_management.model.Notification;
import com.bits.event_management.model.User;
import com.bits.event_management.repository.NotificationRepository;
import com.bits.event_management.repository.UserRepository;
import com.bits.event_management.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public PageResponse<NotificationResponse> getMyNotifications(int page, int size) {
        User user = getCurrentUserEntity();
        Pageable pageable = PageRequest.of(page, size);

        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PageResponse.fromPage(notifications.map(this::mapToNotificationResponse));
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        User user = getCurrentUserEntity();
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to modify this notification");
        }

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToNotificationResponse(updatedNotification);
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

    private NotificationResponse mapToNotificationResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType().name())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
