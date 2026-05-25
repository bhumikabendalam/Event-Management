package com.bits.event_management.repository;

import com.bits.event_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByProviderAndProviderId(com.bits.event_management.model.AuthProvider provider, String providerId);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.providerId = :target OR u.providerId LIKE %:target%")
    Optional<User> findBySocialProviderId(@org.springframework.data.repository.query.Param("target") String target);
}
