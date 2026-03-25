package com.example.monitor.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String timezone = "Asia/Seoul";

    @Column(nullable = false)
    private boolean emailAlertsEnabled = true;

    @Column(length = 500)
    private String slackWebhookUrl;

    @Column(length = 500)
    private String discordWebhookUrl;

    @Column(length = 255)
    private String telegramChatId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan plan = SubscriptionPlan.FREE;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (role == null) {
            role = Role.ROLE_USER;
        }
        if (plan == null) {
            plan = SubscriptionPlan.FREE;
        }
    }
}
