package com.bits.event_management.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "Ticket quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer ticketQuantity;

    private List<AttendeeInfo> attendees;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendeeInfo {
        private String name;
        private String email;
    }
}
