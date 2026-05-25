package com.bits.event_management.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private Long eventId;
    private String eventTitle;
    private String attendeeName;
    private String attendeeEmail;
    private Boolean isCheckedIn;
    private LocalDateTime checkedInAt;
}
