package com.bits.event_management.repository;

import com.bits.event_management.model.Event;
import com.bits.event_management.model.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStatus(EventStatus status, Pageable pageable);
    
    Page<Event> findByCategoryIdAndStatus(Long categoryId, EventStatus status, Pageable pageable);
    
    Page<Event> findByOrganizerId(Long organizerId, Pageable pageable);
    
    Page<Event> findByTitleContainingIgnoreCaseAndStatus(String title, EventStatus status, Pageable pageable);
    
    Page<Event> findByTitleContainingIgnoreCaseAndCategoryIdAndStatus(String title, Long categoryId, EventStatus status, Pageable pageable);
    
    long countByOrganizerId(Long organizerId);
    
    long countByOrganizerIdAndStatus(Long organizerId, EventStatus status);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = :status")
    long countByStatus(EventStatus status);
}
