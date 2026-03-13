package com.sortify.controller;

import com.sortify.model.EmailMessage;
import com.sortify.repository.EmailMessageRepository;
import com.sortify.service.EmailSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {

    private final EmailMessageRepository emailMessageRepository;
    private final EmailSyncService emailSyncService;

    @GetMapping("/urgent")
    public ResponseEntity<Page<EmailMessage>> getUrgentEmails(
            @RequestHeader("Authorization") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<EmailMessage> emails = emailMessageRepository
                .findByUserIdAndIsDisplayedInWidgetTrueOrderByUrgencyScoreDesc(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(emails);
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncEmails(@RequestHeader("Authorization") Long userId) {
        emailSyncService.syncEmailsForUser(userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/seen")
    public ResponseEntity<?> markSeen(
            @RequestHeader("Authorization") Long userId,
            @PathVariable Long id) {
        EmailMessage email = emailMessageRepository.findById(id).orElseThrow();
        if (email.getUser().getId().equals(userId)) {
            email.setSeenInSortify(true);
            emailMessageRepository.save(email);
        }
        return ResponseEntity.ok().build();
    }
}
