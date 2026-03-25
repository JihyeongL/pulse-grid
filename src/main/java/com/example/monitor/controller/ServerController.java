package com.example.monitor.controller;

import com.example.monitor.model.Server;
import com.example.monitor.service.ServerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servers")
@RequiredArgsConstructor
public class ServerController {

    private final ServerService serverService;

    // Helper to extract userId from Authentication context (set by JWT filter)
    private Long getUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<Server> createServer(@Valid @RequestBody Server server, Authentication authentication) {
        Long userId = getUserId(authentication);
        Server created = serverService.createServer(userId, server);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Server>> getServers(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<Server> servers = serverService.getUserServers(userId);
        return ResponseEntity.ok(servers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Server> getServer(@PathVariable Long id, Authentication authentication) {
        Long userId = getUserId(authentication);
        Server server = serverService.getServer(id, userId);
        return ResponseEntity.ok(server);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Server> updateServer(@PathVariable Long id, @Valid @RequestBody Server server,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        Server updated = serverService.updateServer(id, userId, server);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServer(@PathVariable Long id, Authentication authentication) {
        Long userId = getUserId(authentication);
        serverService.deleteServer(id, userId);
        return ResponseEntity.noContent().build();
    }
}
