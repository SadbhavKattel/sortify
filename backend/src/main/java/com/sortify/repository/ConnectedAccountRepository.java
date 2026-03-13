package com.sortify.repository;

import com.sortify.model.ConnectedAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount, Long> {
    List<ConnectedAccount> findByUserId(Long userId);
    ConnectedAccount findByUserIdAndProvider(Long userId, String provider);
}
