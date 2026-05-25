package com.bits.event_management.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime eventDate;
    private String eventVenue;
    private String eventImage;
    private String category;
    private Long userId;
    private String userName;
    private String userEmail;
    private String organizerEmail;
    private LocalDateTime registrationDate;
    private String status;
    private Integer ticketQuantity;
    private BigDecimal totalPrice;
    private String paymentStatus;
    private String paymentId;
    private List<TicketResponse> tickets;
}
