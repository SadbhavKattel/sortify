package com.sortify.controller;

import com.sortify.model.User;
import com.sortify.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.getEmail());
                    newUser.setName(request.getName());
                    return userRepository.save(newUser);
                });
        
        // For MVP, returning the user ID as token
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        return ResponseEntity.ok(response);
    }

    @Data
    static class LoginRequest {
        private String email;
        private String name;
    }

    @Data
    static class AuthResponse {
        private Long userId;
        private String email;
        private String name;
    }
}
