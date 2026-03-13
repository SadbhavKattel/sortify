package com.sortify.repository;

import com.sortify.model.EmailMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailMessageRepository extends JpaRepository<EmailMessage, Long> {
    Page<EmailMessage> findByUserIdOrderByUrgencyScoreDesc(Long userId, Pageable pageable);
    
    // Find all emails displayed in widget for a user
    Page<EmailMessage> findByUserIdAndIsDisplayedInWidgetTrueOrderByUrgencyScoreDesc(Long userId, Pageable pageable);

    boolean existsByProviderMessageId(String providerMessageId);
}
