package com.sortify.provider;

import com.sortify.model.ConnectedAccount;
import com.sortify.model.EmailMessage;
import java.util.List;

public interface EmailProvider {
    /**
     * Identifies the provider (e.g., GMAIL, OUTLOOK)
     */
    String getProviderName();

    /**
     * Start OAuth flow or return authorization URL
     */
    String getAuthorizationUrl();

    /**
     * Exchange auth code for tokens and connection info
     */
    ConnectedAccount exchangeCodeForTokens(String code, Long userId);

    /**
     * Fetch recent important emails directly from the provider.
     */
    List<EmailMessage> fetchRecentImportantEmails(ConnectedAccount account, int maxResults);
}
