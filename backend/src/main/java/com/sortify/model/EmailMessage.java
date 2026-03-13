package com.sortify.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_messages", indexes = {
    @Index(name = "idx_provider_msg_id", columnList = "providerMessageId"),
    @Index(name = "idx_user_urgency", columnList = "user_id, urgencyScore")
})
@Data
@NoArgsConstructor
public class EmailMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String provider; // GMAIL or OUTLOOK
    
    @Column(unique = true, nullable = false)
    private String providerMessageId;
    
    private String providerThreadId;

    private String senderName;
    private String senderEmail;
    
    @Column(length = 1000)
    private String subject;
    
    @Column(length = 2000)
    private String snippet;

    private LocalDateTime receivedAt;
    
    private boolean isImportantFromProvider;
    private boolean isUnread;

    @Column(length = 1000)
    private String deepLinkUrl;

    @Enumerated(EnumType.STRING)
    private UrgencyCategory category;

    private double urgencyScore;

    @Column(length = 2000)
    private String urgencyReasons; // JSON array or comma separated

    private boolean isDisplayedInWidget = true;
    private boolean isSeenInSortify = false;

    private LocalDateTime createdAt = LocalDateTime.now();

}
