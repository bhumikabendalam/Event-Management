package com.bits.event_management.security;

import com.bits.event_management.model.AuthProvider;
import com.bits.event_management.model.User;
import com.bits.event_management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeederRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeederRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        userRepository.findAll().forEach(user -> {
            if (user.getProvider() == AuthProvider.LOCAL || user.getProvider() == null) {
                String encodedPassword = passwordEncoder.encode("password");
                user.setPassword(encodedPassword);
                userRepository.save(user);
                System.out.println("[DatabaseSeederRunner] Updated password hash for local user: " + user.getEmail());
            }
        });
    }
}
