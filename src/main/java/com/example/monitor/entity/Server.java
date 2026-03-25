package com.example.monitor.entity;

import com.example.monitor.enums.MonitorType;
import com.example.monitor.enums.ServerStatus;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "servers")
@Getter
@Setter
public class Server {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "monitor_type", nullable = false)
    private MonitorType monitorType = MonitorType.PING;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(nullable = false)
    private Integer port = 80;

    @Column(name = "health_check_url", length = 500)
    private String healthCheckUrl;

    @NotNull
    @Min(value = 5, message = "Minimum check interval is 5 minutes")
    @Column(name = "check_interval_minutes", nullable = false)
    private Integer checkIntervalMinutes = 5;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServerStatus status = ServerStatus.UNKNOWN;

    @Column(name = "next_check_time")
    private LocalDateTime nextCheckTime;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
