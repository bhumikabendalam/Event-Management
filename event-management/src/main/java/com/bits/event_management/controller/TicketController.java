package com.bits.event_management.controller;

import com.bits.event_management.dto.ApiResponse;
import com.bits.event_management.dto.PageResponse;
import com.bits.event_management.dto.TicketResponse;
import com.bits.event_management.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<TicketResponse>>> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<TicketResponse> response = ticketService.getMyTickets(page, size);
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(@PathVariable Long id) {
        TicketResponse response = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket details retrieved successfully", response));
    }
}
