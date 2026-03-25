package com.example.monitor.scheduler;

import com.example.monitor.model.Server;
import com.example.monitor.model.ServerStatus;
import com.example.monitor.model.ServerStatusHistory;
import com.example.monitor.repository.ServerRepository;
import com.example.monitor.repository.ServerStatusHistoryRepository;
import com.example.monitor.service.AlertService;
import com.example.monitor.service.HealthCheckService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
@RequiredArgsConstructor
public class MonitoringScheduler {

    private final ServerRepository serverRepository;
    private final HealthCheckService healthCheckService;
    private final AlertService alertService;
    private final ServerStatusHistoryRepository historyRepository;

    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    @Scheduled(fixedDelayString = "${app.monitor.scheduler-delay-ms:60000}")
    public void scheduleServerChecks() {
        if (!isRunning.compareAndSet(false, true)) {
            log.info("Previous monitor cycle is still running. Skipping this cycle.");
            return;
        }

        log.info("Starting scheduled server check cycle (Reactive).");

        LocalDateTime now = LocalDateTime.now();
        int batchSize = 100;

        // Fetch and process servers using Flux to maintain low memory footprint
        Flux.generate(() -> 0, (page, sink) -> {
            PageRequest pageRequest = PageRequest.of(page, batchSize);
            var batch = serverRepository.findServersDueForCheck(now, pageRequest);
            if (batch.isEmpty()) {
                sink.complete();
            } else {
                sink.next(batch);
            }
            return page + 1;
        })
                .flatMap(batch -> Flux.fromIterable((Iterable<Server>) batch))
                .parallel(10) // Constant parallelism to avoid resource exhaustion
                .runOn(Schedulers.boundedElastic())
                .flatMap(this::processServerCheck)
                .sequential()
                .doFinally(signalType -> isRunning.set(false))
                .subscribe(
                        null,
                        error -> log.error("Error in monitoring cycle: ", error),
                        () -> log.info("Completed scheduled server check cycle."));
    }

    private Mono<Void> processServerCheck(Server server) {
        return healthCheckService.performCheck(server)
                .flatMap(result -> Mono.fromCallable(() -> {
                    ServerStatus previousStatus = server.getStatus();
                    ServerStatus currentStatus = result.status;

                    server.setStatus(currentStatus);
                    server.setNextCheckTime(LocalDateTime.now().plusMinutes(server.getCheckIntervalMinutes()));
                    serverRepository.save(server);

                    // Save history
                    ServerStatusHistory history = new ServerStatusHistory();
                    history.setServerId(server.getId());
                    history.setStatus(currentStatus);
                    history.setResponseTime(result.responseTime);
                    history.setCheckedAt(LocalDateTime.now());
                    historyRepository.save(history);

                    // Alerting logic
                    if (previousStatus != currentStatus && previousStatus != ServerStatus.UNKNOWN) {
                        alertService.sendAlert(server, previousStatus, currentStatus);
                    }
                    return null;
                }).subscribeOn(Schedulers.boundedElastic()))
                .then()
                .onErrorResume(e -> {
                    log.error("Failed to process check for server {}: {}", server.getId(), e.getMessage());
                    return Mono.empty();
                });
    }
}
