package com.example.monitor.entity;

import com.example.monitor.enums.ServerStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "server_status_history")
@Getter
@Setter
public class ServerStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "server_id", nullable = false)
    private Long serverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServerStatus status;

    @Column(name = "response_time")
    private Long responseTime;

    @Column(name = "checked_at", nullable = false)
    private LocalDateTime checkedAt;
}
