package com.bits.event_management.controller;

import com.bits.event_management.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/api/health", "/api/status"})
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        Map<String, String> statusMap = new HashMap<>();
        statusMap.put("status", "UP");
        statusMap.put("message", "EventFlow API is running smoothly");
        statusMap.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponse.success("Health check succeeded", statusMap));
    }
}
