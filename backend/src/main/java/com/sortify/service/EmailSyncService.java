package com.sortify.service;

import com.sortify.model.ConnectedAccount;
import com.sortify.model.EmailMessage;
import com.sortify.provider.EmailProvider;
import com.sortify.repository.ConnectedAccountRepository;
import com.sortify.repository.EmailMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailSyncService {

    private final ConnectedAccountRepository accountRepository;
    private final EmailMessageRepository emailMessageRepository;
    private final UrgencyClassifierService classifierService;
    private final List<EmailProvider> providers;

    @Transactional
    public void syncEmailsForUser(Long userId) {
        List<ConnectedAccount> accounts = accountRepository.findByUserId(userId);

        Map<String, EmailProvider> providerMap = providers.stream()
                .collect(Collectors.toMap(EmailProvider::getProviderName, Function.identity()));

        for (ConnectedAccount account : accounts) {
            EmailProvider provider = providerMap.get(account.getProvider());
            if (provider != null) {
                try {
                    List<EmailMessage> recentEmails = provider.fetchRecentImportantEmails(account, 20);
                    processFetchedEmails(recentEmails, account);
                } catch (Exception e) {
                    System.err.println("Failed to sync emails for account " + account.getAccountEmail() + ": " + e.getMessage());
                }
            }
        }
    }

    private void processFetchedEmails(List<EmailMessage> emails, ConnectedAccount account) {
        for (EmailMessage email : emails) {
            if (!emailMessageRepository.existsByProviderMessageId(email.getProviderMessageId())) {
                email.setUser(account.getUser());
                
                // Run classifier
                EmailMessage classified = classifierService.classify(email);
                
                emailMessageRepository.save(classified);
            }
        }
    }
}
