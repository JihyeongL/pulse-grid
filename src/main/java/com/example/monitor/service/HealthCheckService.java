package com.example.monitor.service;

import com.example.monitor.enums.ServerStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.example.monitor.entity.Server;
import com.example.monitor.enums.MonitorType;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
public class HealthCheckService {

    private static final int TIMEOUT_MS = 3000;
    private final WebClient webClient = WebClient.builder().build();

    public Mono<HealthCheckResult> performCheck(Server server) {
        Instant startTime = Instant.now();

        Mono<Boolean> checkMono;
        switch (server.getMonitorType()) {
            case PING:
                checkMono = checkPing(server.getIpAddress());
                break;
            case HTTP:
                checkMono = checkHttp(server.getHealthCheckUrl());
                break;
            case REDFISH:
                checkMono = checkRedfish(server.getIpAddress(), server.getPort() != null ? server.getPort() : 443);
                break;
            case SSH:
            default:
                // For SSH/Port check, WebClient doesn't apply directly, but we can wrap it in
                // Mono
                checkMono = Mono.fromCallable(
                        () -> checkPort(server.getIpAddress(), server.getPort() != null ? server.getPort() : 22))
                        .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic());
                break;
        }

        return checkMono
                .map(isUp -> {
                    long responseTime = Duration.between(startTime, Instant.now()).toMillis();
                    ServerStatus status = isUp ? ServerStatus.UP : ServerStatus.DOWN;
                    return new HealthCheckResult(status, responseTime);
                })
                .onErrorResume(e -> {
                    log.debug("Health check failed for server {}: {}", server.getName(), e.getMessage());
                    long responseTime = Duration.between(startTime, Instant.now()).toMillis();
                    return Mono.just(new HealthCheckResult(ServerStatus.DOWN, responseTime));
                });
    }

    private Mono<Boolean> checkPing(String ipAddress) {
        if (ipAddress == null)
            return Mono.just(false);
        return Mono.fromCallable(() -> {
            try {
                InetAddress inet = InetAddress.getByName(ipAddress);
                return inet.isReachable(TIMEOUT_MS);
            } catch (Exception e) {
                return false;
            }
        }).subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic());
    }

    private boolean checkPort(String ipAddress, int port) {
        if (ipAddress == null)
            return false;
        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress(ipAddress, port), TIMEOUT_MS);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Mono<Boolean> checkHttp(String healthCheckUrl) {
        if (healthCheckUrl == null)
            return Mono.just(false);
        return webClient.get()
                .uri(healthCheckUrl)
                .exchangeToMono(response -> Mono
                        .just(response.statusCode().is2xxSuccessful() || response.statusCode().is3xxRedirection()))
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .onErrorReturn(false);
    }

    private Mono<Boolean> checkRedfish(String ipAddress, int port) {
        if (ipAddress == null)
            return Mono.just(false);
        String url = "https://" + ipAddress + ":" + port + "/redfish/v1/Systems";
        return webClient.get()
                .uri(url)
                .exchangeToMono(response -> Mono.just(response.statusCode() == HttpStatus.OK))
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .onErrorResume(e -> {
                    // Fallback to port check if HTTP fails
                    return Mono.fromCallable(() -> checkPort(ipAddress, port))
                            .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic());
                });
    }

    public static class HealthCheckResult {
        public final ServerStatus status;
        public final long responseTime;

        public HealthCheckResult(ServerStatus status, long responseTime) {
            this.status = status;
            this.responseTime = responseTime;
        }
    }
}
