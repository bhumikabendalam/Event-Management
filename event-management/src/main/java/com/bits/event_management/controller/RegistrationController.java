package com.bits.event_management.controller;

import com.bits.event_management.dto.ApiResponse;
import com.bits.event_management.dto.PageResponse;
import com.bits.event_management.dto.RegistrationRequest;
import com.bits.event_management.dto.RegistrationResponse;
import com.bits.event_management.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/api/registrations")
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerForEvent(@Valid @RequestBody RegistrationRequest request) {
        RegistrationResponse response = registrationService.registerForEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Successfully registered for event", response));
    }

    @GetMapping("/api/registrations/me")
    public ResponseEntity<ApiResponse<PageResponse<RegistrationResponse>>> getMyRegistrations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<RegistrationResponse> response = registrationService.getMyRegistrations(page, size);
        return ResponseEntity.ok(ApiResponse.success("User registrations retrieved successfully", response));
    }

    @GetMapping("/api/events/{id}/registrations")
    public ResponseEntity<ApiResponse<PageResponse<RegistrationResponse>>> getEventRegistrations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<RegistrationResponse> response = registrationService.getEventRegistrations(id, page, size);
        return ResponseEntity.ok(ApiResponse.success("Event registrations retrieved successfully", response));
    }
}
