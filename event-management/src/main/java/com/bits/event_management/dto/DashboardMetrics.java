package com.bits.event_management.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetrics {
    private long totalEvents;
    private long activeEvents;
    private long totalRegistrations;
    private long ticketsSold;
    private double totalRevenue;
    private long totalUsers; // Relevant for admin
}
