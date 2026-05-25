package com.bits.event_management.security;

import com.bits.event_management.model.User;
import com.bits.event_management.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("[CustomUserDetailsService] Searching for user by email: '" + email + "'");
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> {
                    System.out.println("[CustomUserDetailsService] USER NOT FOUND FOR EMAIL: '" + email + "'");
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
        System.out.println("[CustomUserDetailsService] USER FOUND: " + user.getName() + " (" + user.getEmail() + "), Role: " + user.getRole());
        return new CustomUserDetails(user);
    }
}
