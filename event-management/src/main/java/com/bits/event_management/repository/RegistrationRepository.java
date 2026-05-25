package com.bits.event_management.repository;

import com.bits.event_management.model.Registration;
import com.bits.event_management.model.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    Page<Registration> findByUserId(Long userId, Pageable pageable);
    
    Page<Registration> findByEventId(Long eventId, Pageable pageable);
    
    List<Registration> findByEventId(Long eventId);
    
    boolean existsByEventIdAndUserIdAndStatusNot(Long eventId, Long userId, RegistrationStatus status);
    
    long countByEventOrganizerId(Long organizerId);

    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM Registration r WHERE r.paymentStatus = 'COMPLETED'")
    double sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM Registration r JOIN r.event e WHERE e.organizer.id = :organizerId AND r.paymentStatus = 'COMPLETED'")
    double sumRevenueByOrganizer(Long organizerId);

    @Query("SELECT COALESCE(SUM(r.ticketQuantity), 0) FROM Registration r WHERE r.status = 'CONFIRMED'")
    long countTotalTicketsSold();

    @Query("SELECT COALESCE(SUM(r.ticketQuantity), 0) FROM Registration r JOIN r.event e WHERE e.organizer.id = :organizerId AND r.status = 'CONFIRMED'")
    long countTicketsSoldByOrganizer(Long organizerId);
}
