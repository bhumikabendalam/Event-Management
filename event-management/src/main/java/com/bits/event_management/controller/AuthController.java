package com.bits.event_management.controller;

import com.bits.event_management.dto.ApiResponse;
import com.bits.event_management.dto.AuthRequest;
import com.bits.event_management.dto.RegisterRequest;
import com.bits.event_management.dto.UserResponse;
import com.bits.event_management.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final String cookieName;
    private final long expirationMs;

    public AuthController(AuthService authService,
                          @Value("${app.jwt.cookie-name}") String cookieName,
                          @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.authService = authService;
        this.cookieName = cookieName;
        this.expirationMs = expirationMs;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> login(@Valid @RequestBody AuthRequest request,
                                                                           HttpServletRequest servletRequest,
                                                                           HttpServletResponse servletResponse) {
        String token = authService.login(request);

        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(servletRequest.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge((int) (expirationMs / 1000));
        servletResponse.addCookie(cookie);

        UserResponse userResponse = authService.getCurrentUser();
        java.util.Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("user", userResponse);
        responseData.put("token", token);

        return ResponseEntity.ok(ApiResponse.success("Login successful", responseData));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest servletRequest,
                                                    HttpServletResponse servletResponse) {
        Cookie cookie = new Cookie(cookieName, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(servletRequest.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge(0);
        servletResponse.addCookie(cookie);

        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        UserResponse userResponse = authService.getCurrentUser();
        if (userResponse == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", userResponse));
    }
}
