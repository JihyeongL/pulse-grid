package com.example.monitor.controller;

import com.example.monitor.repository.ServerRepository;
import com.example.monitor.repository.UserRepository;
import com.example.monitor.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ServerRepository serverRepository;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = userRepository.findAll().stream()
                .map(user -> {
                    long serverCount = serverRepository.countByUserId(user.getId());
                    return new AdminUserResponse(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole().name(),
                            user.getCreatedAt() != null ? user.getCreatedAt().toString() : "",
                            serverCount);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Manually delete attached servers since cascading wasn't explicitly defined on
        // Server entity
        serverRepository.findByUserId(id).forEach(server -> serverRepository.delete(server));

        // Delete user
        userRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }

    @Data
    @AllArgsConstructor
    public static class AdminUserResponse {
        private Long id;
        private String username;
        private String email;
        private String role;
        private String createdAt;
        private long serverCount;
    }
}
