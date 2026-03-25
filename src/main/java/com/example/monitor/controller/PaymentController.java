package com.example.monitor.controller;

import com.example.monitor.model.SubscriptionPlan;
import com.example.monitor.model.User;
import com.example.monitor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final UserRepository userRepository;

    @PostMapping("/simulate-success")
    public ResponseEntity<?> simulateSuccess(@AuthenticationPrincipal Long userId) {
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Mock payment process: Simply upgrade the user to PRO
        user.setPlan(SubscriptionPlan.PRO);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Payment simulated successfully. Your account has been upgraded to PRO!",
                "newPlan", SubscriptionPlan.PRO.name(),
                "newLimit", SubscriptionPlan.PRO.getMaxServers()));
    }
}
