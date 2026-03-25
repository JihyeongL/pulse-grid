package com.example.monitor.controller;

import com.example.monitor.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            authService.register(request.getUsername(), request.getEmail(), request.getPassword());
            return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest request) {
        try {
            Map<String, String> token = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect email or password"));
        }
    }

    @Data
    static class RegisterRequest {
        private String username;
        private String email;
        private String password;
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }
}
