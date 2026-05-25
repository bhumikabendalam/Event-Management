package com.bits.event_management.service;

import com.bits.event_management.dto.AuthRequest;
import com.bits.event_management.dto.RegisterRequest;
import com.bits.event_management.dto.UserResponse;
import com.bits.event_management.exception.BadRequestException;
import com.bits.event_management.model.AuthProvider;
import com.bits.event_management.model.Role;
import com.bits.event_management.model.User;
import com.bits.event_management.repository.UserRepository;
import com.bits.event_management.security.CustomUserDetails;
import com.bits.event_management.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role userRole = Role.ROLE_PARTICIPANT;
        if (request.getRole() != null) {
            try {
                String normalizedRole = request.getRole().toUpperCase();
                if (!normalizedRole.startsWith("ROLE_")) {
                    normalizedRole = "ROLE_" + normalizedRole;
                }
                Role targetRole = Role.valueOf(normalizedRole);
                if (targetRole == Role.ROLE_ADMIN) {
                    throw new BadRequestException("Cannot register as Admin");
                }
                userRole = targetRole;
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role specified. Use PARTICIPANT or ORGANIZER.");
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .provider(AuthProvider.LOCAL)
                .build();

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public String login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            User user = ((CustomUserDetails) principal).getUser();
            // Fetch fresh details from DB to make sure we return correct context
            return userRepository.findById(user.getId())
                    .map(this::mapToUserResponse)
                    .orElse(mapToUserResponse(user));
        }
        return null;
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .provider(user.getProvider() != null ? user.getProvider().name() : AuthProvider.LOCAL.name())
                .build();
    }
}
