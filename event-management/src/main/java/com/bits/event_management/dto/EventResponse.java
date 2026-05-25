package com.bits.event_management.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal price;
    private Integer capacity;
    private Integer availableSeats;
    private String status;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private Long organizerId;
    private String organizerName;
    private Double averageRating;
    private String duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
