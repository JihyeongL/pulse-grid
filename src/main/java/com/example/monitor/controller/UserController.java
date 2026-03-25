package com.example.monitor.controller;

import com.example.monitor.repository.ServerRepository;
import com.example.monitor.repository.UserRepository;
import com.example.monitor.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import com.example.monitor.model.User;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ServerRepository serverRepository;
    private final AuthService authService;

    @org.springframework.beans.factory.annotation.Value("${app.monitor.max-servers-per-user:3}")
    private int maxServersPerUser;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal Long userId) {
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        long serverCount = serverRepository.countByUserId(userId);

        return userRepository.findById(userId)
                .map(user -> {
                    String roleName = user.getRole() != null ? user.getRole().name() : "ROLE_USER";
                    return ResponseEntity.ok(new UserProfileResponse(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            roleName,
                            user.getTimezone(),
                            user.isEmailAlertsEnabled(),
                            user.getSlackWebhookUrl(),
                            user.getDiscordWebhookUrl(),
                            user.getTelegramChatId(),
                            serverCount,
                            user.getPlan().getMaxServers(),
                            user.getPlan().name()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<?> updatePreferences(@AuthenticationPrincipal Long userId,
            @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.containsKey("timezone")) {
            user.setTimezone(String.valueOf(request.get("timezone")));
        }
        if (request.containsKey("emailAlertsEnabled")) {
            user.setEmailAlertsEnabled(Boolean.parseBoolean(String.valueOf(request.get("emailAlertsEnabled"))));
        }
        if (request.containsKey("slackWebhookUrl")) {
            user.setSlackWebhookUrl(
                    request.get("slackWebhookUrl") != null ? String.valueOf(request.get("slackWebhookUrl")) : null);
        }
        if (request.containsKey("discordWebhookUrl")) {
            user.setDiscordWebhookUrl(
                    request.get("discordWebhookUrl") != null ? String.valueOf(request.get("discordWebhookUrl")) : null);
        }
        if (request.containsKey("telegramChatId")) {
            user.setTelegramChatId(
                    request.get("telegramChatId") != null ? String.valueOf(request.get("telegramChatId")) : null);
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Preferences updated successfully."));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(@AuthenticationPrincipal Long userId) {
        if (userId == null || !userRepository.existsById(userId)) {
            return ResponseEntity.status(401).build();
        }

        // Delete all associated servers for this user
        serverRepository.findByUserId(userId).forEach(server -> serverRepository.delete(server));

        // Delete the user record
        userRepository.deleteById(userId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal Long userId,
            @RequestBody PasswordChangeRequest request) {
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            authService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Data
    @AllArgsConstructor
    static class UserProfileResponse {
        private Long id;
        private String username;
        private String email;
        private String role;
        private String timezone;
        private boolean emailAlertsEnabled;
        private String slackWebhookUrl;
        private String discordWebhookUrl;
        private String telegramChatId;
        private long serverCount;
        private int maxServerLimit;
        private String plan;
    }

    @Data
    static class PasswordChangeRequest {
        private String oldPassword;
        private String newPassword;
    }
}
