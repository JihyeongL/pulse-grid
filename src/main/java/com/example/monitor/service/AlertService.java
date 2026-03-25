package com.example.monitor.service;

import com.example.monitor.entity.Server;
import com.example.monitor.enums.ServerStatus;
import com.example.monitor.entity.User;
import com.example.monitor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final UserRepository userRepository;
    private final WebClient webClient = WebClient.builder().build();

    @Value("${telegram.bot.token:}")
    private String telegramBotToken;

    public void sendAlert(Server server, ServerStatus previousStatus, ServerStatus newStatus) {
        if (server.getUserId() == null)
            return;
        Optional<User> userOpt = userRepository.findById(server.getUserId());
        if (userOpt.isEmpty())
            return;

        User user = userOpt.get();
        if (newStatus == ServerStatus.DOWN) {
            log.warn("ALERT: Server '{}' (ID: {}, User: {}) is DOWN! Previous status: {}",
                    server.getName(), server.getId(), server.getUserId(), previousStatus);
            dispatchNotifications(user, server, "DOWN");
        } else if (newStatus == ServerStatus.UP && previousStatus == ServerStatus.DOWN) {
            log.info("RECOVERY: Server '{}' (ID: {}, User: {}) has RECOVERED and is now UP!",
                    server.getName(), server.getId(), server.getUserId());
            dispatchNotifications(user, server, "RECOVERED");
        } else if (newStatus == ServerStatus.WARNING) {
            log.warn("WARNING: Server '{}' (ID: {}, User: {}) is experiencing issues (WARNING)! Previous status: {}",
                    server.getName(), server.getId(), server.getUserId(), previousStatus);
            dispatchNotifications(user, server, "WARNING");
        }
    }

    private void dispatchNotifications(User user, Server server, String status) {
        String msg = String.format("Server %s is now %s.", server.getName(), status);

        if (user.isEmailAlertsEnabled()) {
            log.info("[Email Dispatch] Sending to {}: {}", user.getEmail(), msg);
        }
        if (user.getSlackWebhookUrl() != null && !user.getSlackWebhookUrl().isEmpty()) {
            log.info("[Slack Dispatch] Sending to {}: {}", user.getSlackWebhookUrl(), msg);
            sendWebhook(user.getSlackWebhookUrl(), Map.of("text", msg)).subscribe();
        }
        if (user.getDiscordWebhookUrl() != null && !user.getDiscordWebhookUrl().isEmpty()) {
            log.info("[Discord Dispatch] Sending to {}: {}", user.getDiscordWebhookUrl(), msg);
            sendWebhook(user.getDiscordWebhookUrl(), Map.of("content", msg)).subscribe();
        }
        if (user.getTelegramChatId() != null && !user.getTelegramChatId().isEmpty()) {
            if (telegramBotToken != null && !telegramBotToken.isEmpty()) {
                log.info("[Telegram Dispatch] Sending to {}: {}", user.getTelegramChatId(), msg);
                String telegramUrl = "https://api.telegram.org/bot" + telegramBotToken + "/sendMessage";
                sendWebhook(telegramUrl, Map.of("chat_id", user.getTelegramChatId(), "text", msg)).subscribe();
            } else {
                log.warn("[Telegram Dispatch] Cannot send to {} because telegram.bot.token is not configured.",
                        user.getTelegramChatId());
            }
        }
    }

    private Mono<Void> sendWebhook(String url, Map<String, Object> payload) {
        return webClient.post()
                .uri(url)
                .bodyValue(payload)
                .retrieve()
                .toBodilessEntity()
                .then()
                .onErrorResume(e -> {
                    log.error("Failed to send webhook to {}: {}", url, e.getMessage());
                    return Mono.empty();
                });
    }
}
