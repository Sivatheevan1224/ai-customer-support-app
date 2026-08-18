package com.support.ai.service;

import com.support.ai.model.KnowledgeArticle;
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
public class RAGSearchEngineService {

    private final KnowledgeArticleRepository articleRepository;

    @Value("${ai.provider:builtin-rag}")
    private String aiProvider;

    @Value("${ai.api-key:demo-key}")
    private String apiKey;

    @Value("${ai.model:gpt-4o-mini}")
    private String aiModel;

    @Data
    @AllArgsConstructor
    @Builder
    public static class RAGResult {
        private String answer;
        private double confidenceScore; // 0.0 to 1.0
        private boolean requiresEscalation;
        private List<KnowledgeArticle> referencedArticles;
    }

    public RAGResult processCustomerQuery(String userQuery) {
        if (userQuery == null || userQuery.trim().isEmpty()) {
            return RAGResult.builder()
                    .answer("Please type a question or issue you'd like help with!")
                    .confidenceScore(0.0)
                    .requiresEscalation(false)
                    .referencedArticles(Collections.emptyList())
                    .build();
        }
        if (isGreeting(userQuery)) {
            return RAGResult.builder()
                    .answer("Hello! How can I assist you today? You can ask me questions about password reset, subscription billing, API rate limits, or account settings.")
                    .confidenceScore(1.0)
                    .requiresEscalation(false)
                    .referencedArticles(Collections.emptyList())
                    .build();
        }

        List<KnowledgeArticle> articles = articleRepository.findByIsPublishedTrue();
        if (articles.isEmpty()) {
            return RAGResult.builder()
                    .answer("I couldn't find relevant information in our knowledge base right now. Would you like me to connect you with a live support agent?")
                    .confidenceScore(0.2)
                    .requiresEscalation(true)
                    .referencedArticles(Collections.emptyList())
                    .build();
        }

        // Rank articles by relevance
        List<ArticleMatch> scoredArticles = articles.stream()
                .map(article -> new ArticleMatch(article, calculateRelevance(userQuery, article)))
                .filter(match -> match.getScore() > 0.15)
                .sorted(Comparator.comparingDouble((ArticleMatch match) -> match.getScore()).reversed())
                .collect(Collectors.toList());

        if (scoredArticles.isEmpty()) {
            return RAGResult.builder()
                    .answer("I'm not completely certain about the answer to that based on our documentation. Let me open a support ticket for an agent to assist you right away!")
                    .confidenceScore(0.3)
                    .requiresEscalation(true)
                    .referencedArticles(Collections.emptyList())
                    .build();
        }

        ArticleMatch topMatch = scoredArticles.get(0);
        KnowledgeArticle bestArticle = topMatch.getArticle();
        double confidence = Math.min(topMatch.getScore(), 0.98);

        List<KnowledgeArticle> cited = scoredArticles.stream()
                .limit(2)
                .map(match -> match.getArticle())
                .collect(Collectors.toList());

        // Generate response snippet from knowledge article context
        String answer = generateResponseText(userQuery, bestArticle, confidence);

        return RAGResult.builder()
                .answer(answer)
                .confidenceScore(confidence)
                .requiresEscalation(confidence < 0.55)
                .referencedArticles(cited)
                .build();
    }

    private double calculateRelevance(String query, KnowledgeArticle article) {
        String[] queryWords = query.toLowerCase().replaceAll("[^a-zA-Z0-9 ]", "").split("\\s+");
        String title = article.getTitle().toLowerCase();
        String content = article.getContent().toLowerCase();
        String tags = article.getTags() != null ? article.getTags().toLowerCase() : "";
        String category = article.getCategory().toLowerCase();

        double score = 0.0;
        int matchedWords = 0;

        for (String word : queryWords) {
            if (word.length() <= 2) continue; // ignore short stop words

            if (title.contains(word)) {
                score += 0.35;
                matchedWords++;
            }
            if (tags.contains(word)) {
                score += 0.25;
                matchedWords++;
            }
            if (category.contains(word)) {
                score += 0.20;
            }
            if (content.contains(word)) {
                score += 0.15;
                matchedWords++;
            }
        }

        if (queryWords.length > 0) {
            double coverage = (double) matchedWords / queryWords.length;
            score = (score * 0.7) + (coverage * 0.3);
        }

        return Math.min(score, 1.0);
    }

    private String generateResponseText(String query, KnowledgeArticle article, double confidence) {
        StringBuilder sb = new StringBuilder();

        sb.append("Based on our Knowledge Base article **\"").append(article.getTitle()).append("\"**:\n\n");

        // Clean content preview
        String text = article.getContent();
        if (text.length() > 350) {
            sb.append(text.substring(0, 350)).append("...\n\n");
        } else {
            sb.append(text).append("\n\n");
        }

        if (confidence >= 0.75) {
            sb.append("*Hope this helps! Let me know if you need further assistance or need a live representative.*");
        } else {
            sb.append("*Note: If this doesn't fully answer your question, you can easily escalate this chat to create a support ticket.*");
        }

        return sb.toString();
    }

    private boolean isGreeting(String query) {
        if (query == null) return false;
        String clean = query.toLowerCase().replaceAll("[^a-z ]", "").trim();
        return clean.equals("hi") || clean.equals("hello") || clean.equals("hey") || 
               clean.equals("hi there") || clean.equals("hello there") || clean.equals("greetings") ||
               clean.equals("good morning") || clean.equals("good afternoon") || clean.equals("good evening") ||
               clean.equals("help") || clean.equals("hey there");
    }

    public static class ArticleMatch {
        private final KnowledgeArticle article;
        private final double score;

        public ArticleMatch(KnowledgeArticle article, double score) {
            this.article = article;
            this.score = score;
        }

        public KnowledgeArticle getArticle() {
            return article;
        }

        public double getScore() {
            return score;
        }
    }
}
