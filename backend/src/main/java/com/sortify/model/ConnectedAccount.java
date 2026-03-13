package com.sortify.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "connected_accounts")
@Data
@NoArgsConstructor
public class ConnectedAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String provider; // GMAIL or OUTLOOK

    @Column(nullable = false)
    private String accountEmail;

    @Column(length = 2048)
    private String accessToken;

    @Column(length = 2048)
    private String refreshToken;

    private Long expiresAt; // Epoch millis

}
