package com.example.monitor.repository;

import com.example.monitor.entity.ServerStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServerStatusHistoryRepository extends JpaRepository<ServerStatusHistory, Long> {
    List<ServerStatusHistory> findByServerIdOrderByCheckedAtDesc(Long serverId);
}
