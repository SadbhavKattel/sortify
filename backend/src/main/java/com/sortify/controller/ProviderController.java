package com.sortify.controller;

import com.sortify.model.ConnectedAccount;
import com.sortify.model.User;
import com.sortify.provider.EmailProvider;
import com.sortify.repository.ConnectedAccountRepository;
import com.sortify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * ProviderController.java
 * 
 * Handles OAuth connections between the mobile app and email providers (Gmail).
 * The mobile app sends its Google access token here after sign-in,
 * and this controller stores it so the backend can access Gmail on behalf of the user.
 */
@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final List<EmailProvider> providers;
    private final ConnectedAccountRepository accountRepository;
    private final UserRepository userRepository;

    @GetMapping("/{providerName}/auth-url")
    public ResponseEntity<?> getAuthUrl(@PathVariable String providerName) {
        EmailProvider provider = providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(providerName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        return ResponseEntity.ok(Map.of("url", provider.getAuthorizationUrl()));
    }

    @PostMapping("/oauth2/callback/gmail/token")
    public ResponseEntity<?> receiveGmailToken(@RequestBody Map<String, String> request) {
        String accessToken = request.get("accessToken");
        Long userId = 1L; 
        
        User user = userRepository.findById(userId).orElseThrow();
        ConnectedAccount account = new ConnectedAccount();
        account.setProvider("GMAIL");
        account.setAccessToken(accessToken);
        account.setRefreshToken("N/A");
        account.setExpiresAt(System.currentTimeMillis() + 3600 * 1000L);
        account.setAccountEmail("Connected Google Account"); 
        account.setUser(user);
        
        ConnectedAccount existing = accountRepository.findByUserIdAndProvider(userId, "GMAIL");
        if (existing != null) {
            existing.setAccessToken(accessToken);
            existing.setExpiresAt(account.getExpiresAt());
            accountRepository.save(existing);
        } else {
            accountRepository.save(account);
        }

        return ResponseEntity.ok(Map.of("message", "Successfully connected Gmail."));
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getConnectedProviders(@RequestHeader("Authorization") Long userId) {
        List<ConnectedAccount> accounts = accountRepository.findByUserId(userId);
        return ResponseEntity.ok(accounts.stream().map(ConnectedAccount::getProvider).collect(Collectors.toList()));
    }
}
