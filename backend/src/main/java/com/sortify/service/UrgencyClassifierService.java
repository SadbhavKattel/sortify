package com.sortify.service;

import com.sortify.model.EmailMessage;
import com.sortify.model.UrgencyCategory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class UrgencyClassifierService {

    // Threshold above which an email is considered 'Urgent' and shown in widget
    private static final double URGENCY_THRESHOLD = 50.0;

    // High Urgency Keywords
    private static final Pattern HIGH_URGENCY_PATTERN = Pattern.compile("(?i)\\b(today|now|immediately|urgent|fraud|suspicious activity|verify now|exam today|cancelled|rescheduled|starts in|payment declined|security alert|gate changed|meeting moved to|action required)\\b");
    
    // Low Urgency Keywords
    private static final Pattern LOW_URGENCY_PATTERN = Pattern.compile("(?i)\\b(newsletter|promotion|sale|weekly update|assignment posted|grades available|receipt|digest|social|marketing|optional|reminder for next week)\\b");

    // Trusted Sender Domains (Examples)
    private static final List<String> HIGH_TRUST_DOMAINS = List.of(
        "bank", "chase.com", "wellsfargo.com", "citi.com", 
        "edu", "university", "canvas", "blackboard",
        "airline", "delta.com", "aa.com", "united.com", "flight",
        "doctor", "hospital", "mychart"
    );

    private static final List<String> LOW_TRUST_DOMAINS = List.of(
        "marketing", "noreply", "no-reply", "promotions", "newsletter"
    );

    public EmailMessage classify(EmailMessage email) {
        double score = 0.0;
        List<String> reasons = new ArrayList<>();
        UrgencyCategory category = UrgencyCategory.OTHER_URGENT;

        String searchContext = (email.getSubject() + " " + email.getSnippet()).toLowerCase();
        String senderContext = (email.getSenderName() + " " + email.getSenderEmail()).toLowerCase();

        // 1. Keyword Analysis
        int highHits = countRegexMatches(HIGH_URGENCY_PATTERN, searchContext);
        if (highHits > 0) {
            score += Math.min(highHits * 30.0, 90.0); // Max 90 from keywords
            reasons.add("Contains urgent keywords (" + highHits + " hits)");
            
            if (searchContext.contains("fraud") || searchContext.contains("security") || searchContext.contains("verify now") || searchContext.contains("suspicious")) {
                category = UrgencyCategory.SECURITY_ALERT;
                score += 20;
            } else if (searchContext.contains("declined") || searchContext.contains("payment")) {
                category = UrgencyCategory.FINANCIAL_ALERT;
            } else if (searchContext.contains("exam") || searchContext.contains("class")) {
                category = UrgencyCategory.ACADEMIC_TODAY;
            } else if (searchContext.contains("flight") || searchContext.contains("gate") || searchContext.contains("cancelled")) {
                category = UrgencyCategory.TRAVEL_DISRUPTION;
            } else if (searchContext.contains("meeting")) {
                category = UrgencyCategory.WORK_TODAY;
            }
        }

        int lowHits = countRegexMatches(LOW_URGENCY_PATTERN, searchContext);
        if (lowHits > 0) {
            score -= Math.min(lowHits * 20.0, 60.0);
            reasons.add("Contains non-urgent keywords");
        }

        // 2. Sender Trust Analysis
        boolean isHighTrust = HIGH_TRUST_DOMAINS.stream().anyMatch(senderContext::contains);
        boolean isLowTrust = LOW_TRUST_DOMAINS.stream().anyMatch(senderContext::contains);
        
        if (isHighTrust) {
            score += 20.0;
            reasons.add("Trusted priority sender");
        }
        if (isLowTrust) {
            score -= 30.0;
            reasons.add("Marketing/Bulk sender domain");
        }

        // 3. Time Sensitivity (Heuristic: emails received today boost score if they have action words)
        if (email.getReceivedAt() != null && email.getReceivedAt().toLocalDate().isEqual(LocalDateTime.now().toLocalDate())) {
            score += 10.0; // Base boost for today
            if (highHits > 0) score += 15.0; // Multiplier if urgent and received today
        }

        // Provider 'important' flag base logic
        if (email.isImportantFromProvider()) {
            score += 10.0;
        }

        // Constrain score
        score = Math.max(0.0, Math.min(score, 100.0));

        // Evaluate results
        if (score >= URGENCY_THRESHOLD) {
            email.setDisplayedInWidget(true);
            if (category == UrgencyCategory.OTHER_URGENT) {
                category = UrgencyCategory.IMMEDIATE_ACTION_NEEDED;
            }
        } else {
            email.setDisplayedInWidget(false);
            category = UrgencyCategory.NOT_URGENT;
            reasons.add("Below urgency threshold");
        }

        email.setUrgencyScore(score);
        email.setCategory(category);
        email.setUrgencyReasons(String.join(" | ", reasons));

        return email;
    }

    private int countRegexMatches(Pattern pattern, String text) {
        if (text == null) return 0;
        java.util.regex.Matcher matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }
}
