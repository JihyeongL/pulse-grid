package com.example.monitor.controller;

import com.example.monitor.entity.Server;
import com.example.monitor.repository.ServerRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
public class PublicStatusController {

    private final ServerRepository serverRepository;

    @GetMapping("/{username}")
    public ResponseEntity<List<ServerStatusResponse>> getPublicStatus(@PathVariable String username) {
        List<Server> servers = serverRepository.findByUserUsername(username);

        List<ServerStatusResponse> response = servers.stream()
                .map(s -> ServerStatusResponse.builder()
                        .name(s.getName())
                        .status(s.getStatus().name())
                        .lastCheckTime(s.getNextCheckTime() != null ? 
                                s.getNextCheckTime().minusMinutes(s.getCheckIntervalMinutes()) : null)
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @Data
    @Builder
    public static class ServerStatusResponse {
        private String name;
        private String status;
        private LocalDateTime lastCheckTime;
    }
}
