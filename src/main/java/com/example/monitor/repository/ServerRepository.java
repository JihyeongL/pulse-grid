package com.example.monitor.repository;

import com.example.monitor.entity.Server;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServerRepository extends JpaRepository<Server, Long> {

    long countByUserId(Long userId);

    List<Server> findByUserId(Long userId);

    // Fetch servers for public status page by username
    @Query("SELECT s FROM Server s JOIN User u ON s.userId = u.id WHERE u.username = :username")
    List<Server> findByUserUsername(@Param("username") String username);

    // Fetch servers that need to be checked.
    // If nextCheckTime is null, it hasn't been checked yet.
    @Query("SELECT s FROM Server s WHERE s.nextCheckTime IS NULL OR " +
            "s.nextCheckTime <= :now")
    List<Server> findServersDueForCheck(@Param("now") LocalDateTime now, Pageable pageable);
}
