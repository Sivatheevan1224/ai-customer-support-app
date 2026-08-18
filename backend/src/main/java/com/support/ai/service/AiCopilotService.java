package com.support.ai.service;

import com.support.ai.model.KnowledgeArticle;
import com.support.ai.model.Ticket;
import com.support.ai.model.TicketMessage;
import com.support.ai.repository.KnowledgeArticleRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiCopilotService {

    private final KnowledgeArticleRepository articleRepository;

    @Value("${ai.provider:builtin-rag}")
    private String aiProvider;

    @Value("${ai.model:gpt-4o-mini}")
    private String aiModel;

    @Data
    @AllArgsConstructor
    @Builder
    public static class CopilotAnalysis {
        private String summary;
        private String sentiment; // POSITIVE, NEUTRAL, FRUSTRATED, URGENT
        private String suggestedPriority; // LOW, MEDIUM, HIGH, URGENT
        private List<String> tags;
        private List<String> suggestedReplies;
        private List<KnowledgeArticle> relevantArticles;
    }

    public CopilotAnalysis analyzeTicket(Ticket ticket, List<TicketMessage> messages) {
        String fullText = ticket.getTitle() + " " + ticket.getDescription();
        if (messages != null) {
            for (TicketMessage msg : messages) {
                fullText += " " + msg.getContent();
            }
        }

        String sentiment = detectSentiment(fullText);
        String suggestedPriority = determinePriority(sentiment, fullText);
        List<String> tags = generateAutoTags(fullText);
        String summary = generateSummary(ticket, fullText);
        
        List<KnowledgeArticle> relevantArticles = findMatchingArticles(fullText);
        List<String> suggestedReplies = generateSuggestedReplies(ticket, relevantArticles, sentiment);

        return CopilotAnalysis.builder()
                .summary(summary)
                .sentiment(sentiment)
                .suggestedPriority(suggestedPriority)
                .tags(tags)
                .suggestedReplies(suggestedReplies)
                .relevantArticles(relevantArticles)
                .build();
    }

    public String detectSentiment(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("asap") || lower.contains("immediately") || lower.contains("broken") || lower.contains("down") || lower.contains("emergency") || lower.contains("urgent")) {
            return "URGENT";
        }
        if (lower.contains("angry") || lower.contains("unacceptable") || lower.contains("terrible") || lower.contains("refund") || lower.contains("cancel") || lower.contains("horrible") || lower.contains("worst")) {
            return "FRUSTRATED";
        }
        if (lower.contains("thanks") || lower.contains("great") || lower.contains("awesome") || lower.contains("love")) {
            return "POSITIVE";
        }
        return "NEUTRAL";
    }

    private String determinePriority(String sentiment, String text) {
        if ("URGENT".equals(sentiment)) return "URGENT";
        if ("FRUSTRATED".equals(sentiment)) return "HIGH";
        String lower = text.toLowerCase();
        if (lower.contains("billing") || lower.contains("payment") || lower.contains("bug") || lower.contains("error")) {
            return "HIGH";
        }
        return "MEDIUM";
    }

    private List<String> generateAutoTags(String text) {
        Set<String> tags = new HashSet<>();
        String lower = text.toLowerCase();

        if (lower.contains("password") || lower.contains("login") || lower.contains("auth") || lower.contains("2fa")) tags.add("Authentication");
        if (lower.contains("bill") || lower.contains("invoice") || lower.contains("charge") || lower.contains("subscription") || lower.contains("refund")) tags.add("Billing");
        if (lower.contains("api") || lower.contains("webhook") || lower.contains("token") || lower.contains("integration")) tags.add("API & Dev");
        if (lower.contains("slow") || lower.contains("latency") || lower.contains("timeout") || lower.contains("performance")) tags.add("Performance");
        if (lower.contains("mobile") || lower.contains("ios") || lower.contains("android") || lower.contains("app")) tags.add("Mobile");
        
        if (tags.isEmpty()) {
            tags.add("General Support");
        }
        return new ArrayList<>(tags);
    }

    private String generateSummary(Ticket ticket, String text) {
        return "Customer reported: \"" + ticket.getTitle() + "\". Key context: " +
               (ticket.getDescription().length() > 120 ? ticket.getDescription().substring(0, 120) + "..." : ticket.getDescription());
    }

    private List<KnowledgeArticle> findMatchingArticles(String text) {
        List<KnowledgeArticle> all = articleRepository.findByIsPublishedTrue();
        String lower = text.toLowerCase();

        return all.stream()
                .filter(art -> {
                    String title = art.getTitle().toLowerCase();
                    String tags = art.getTags() != null ? art.getTags().toLowerCase() : "";
                    return lower.contains(title) || Arrays.stream(title.split(" ")).anyMatch(w -> w.length() > 4 && lower.contains(w)) ||
                           Arrays.stream(tags.split(",")).anyMatch(t -> !t.trim().isEmpty() && lower.contains(t.trim().toLowerCase()));
                })
                .limit(3)
                .collect(Collectors.toList());
    }

    private List<String> generateSuggestedReplies(Ticket ticket, List<KnowledgeArticle> articles, String sentiment) {
        List<String> replies = new ArrayList<>();
        String name = ticket.getCustomerName() != null ? ticket.getCustomerName() : "Valued Customer";

        String greeting = "FRUSTRATED".equals(sentiment)
                ? "Hello " + name + ", I am sincerely sorry to hear you're experiencing this issue. Let's get this resolved for you right away."
                : "Hi " + name + ", thanks for reaching out to our support team!";

        if (!articles.isEmpty()) {
            KnowledgeArticle top = articles.get(0);
            replies.add(greeting + "\n\nI recommend following the steps outlined in our guide: \"" + top.getTitle() + "\":\n\n" +
                        (top.getContent().length() > 250 ? top.getContent().substring(0, 250) + "..." : top.getContent()) +
                        "\n\nPlease let me know if this fixes the issue!");
        }

        replies.add(greeting + "\n\nI have investigated your request regarding \"" + ticket.getTitle() + "\". Could you please confirm your account ID or share a quick screenshot so I can verify the details on our end?");

        replies.add(greeting + "\n\nGreat news! I have updated your ticket status and implemented the fix. Please retry now and let us know if everything is working smoothly.");

        return replies;
    }
}
