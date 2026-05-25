package com.bits.event_management.service;

import com.bits.event_management.dto.UpdateProfileRequest;
import java.util.Optional;
import com.bits.event_management.dto.UserResponse;
import com.bits.event_management.exception.BadRequestException;
import com.bits.event_management.exception.ResourceNotFoundException;
import com.bits.event_management.model.User;
import com.bits.event_management.repository.UserRepository;
import com.bits.event_management.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    public UserResponse updateProfile(UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new BadRequestException("Unauthorized");
        }

        User currentUser = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            String newEmail = request.getEmail().trim();
            Optional<User> existingUserOptional = userRepository.findByEmailIgnoreCase(newEmail);
            if (existingUserOptional.isPresent()) {
                User existingUser = existingUserOptional.get();
                // If current logged-in user is a social OAuth user, link this provider to the existing account and remove temporary dummy user
                if (user.getProvider() != com.bits.event_management.model.AuthProvider.LOCAL) {
                    existingUser.setProvider(user.getProvider());
                    
                    // Link and merge the social providers together in the existing account's providerId column
                    String existingLinks = existingUser.getProviderId();
                    String dummyUserLinks = user.getProviderId();
                    
                    if (existingLinks == null || existingLinks.trim().isEmpty()) {
                        existingUser.setProviderId(dummyUserLinks);
                    } else if (dummyUserLinks != null && !dummyUserLinks.trim().isEmpty()) {
                        java.util.Set<String> mergedSet = new java.util.LinkedHashSet<>();
                        for (String link : existingLinks.split(";")) {
                            if (!link.trim().isEmpty()) mergedSet.add(link.trim());
                        }
                        for (String link : dummyUserLinks.split(";")) {
                            if (!link.trim().isEmpty()) mergedSet.add(link.trim());
                        }
                        existingUser.setProviderId(String.join(";", mergedSet));
                    }
                    
                    if (request.getName() != null && !request.getName().trim().isEmpty()) {
                        existingUser.setName(request.getName());
                    }
                    userRepository.save(existingUser);
                    userRepository.delete(user);
                    
                    // Point to the newly linked existing user so the save and returned payload reflect the merged account
                    user = existingUser;
                } else {
                    throw new BadRequestException("Email address is already in use by another account.");
                }
            } else {
                user.setEmail(newEmail);
            }
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isEmpty()) {
                throw new BadRequestException("Current password is required to update password");
            }
            if (user.getPassword() != null && !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password does not match");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .provider(user.getProvider() != null ? user.getProvider().name() : "LOCAL")
                .build();
    }
}
