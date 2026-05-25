package com.bits.event_management.controller;

import com.bits.event_management.dto.ApiResponse;
import com.bits.event_management.dto.UpdateProfileRequest;
import com.bits.event_management.dto.UserResponse;
import com.bits.event_management.service.UserService;
import com.bits.event_management.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final String cookieName;
    private final long expirationMs;

    public UserController(UserService userService,
                          JwtUtil jwtUtil,
                          @Value("${app.jwt.cookie-name}") String cookieName,
                          @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.cookieName = cookieName;
        this.expirationMs = expirationMs;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                                   HttpServletRequest servletRequest,
                                                                   HttpServletResponse servletResponse) {
        UserResponse response = userService.updateProfile(request);

        // Generate a fresh JWT token for the updated user
        String token = jwtUtil.generateToken(response.getEmail(), response.getRole());

        // Update the HttpOnly cookie
        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(servletRequest.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge((int) (expirationMs / 1000));
        servletResponse.addCookie(cookie);

        // Expose new token in response header for frontend synchronization
        servletResponse.setHeader("X-Auth-Token", token);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}
