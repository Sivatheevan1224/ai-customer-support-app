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

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "how", "are", "you", "what", "where", "when", "why", "who", "this", "that",
            "with", "from", "have", "your", "does", "can", "will", "okay", "about",
            "them", "they", "there", "here", "been", "was", "were", "would", "should"
    ));

    private double calculateRelevance(String query, KnowledgeArticle article) {
        String[] queryWords = query.toLowerCase().replaceAll("[^a-zA-Z0-9 ]", "").split("\\s+");
        String title = article.getTitle().toLowerCase();
        String content = article.getContent().toLowerCase();
        String tags = article.getTags() != null ? article.getTags().toLowerCase() : "";
        String category = article.getCategory().toLowerCase();

        double score = 0.0;
        int matchedWords = 0;
        int meaningfulQueryWords = 0;

        for (String word : queryWords) {
            if (word.length() <= 2 || STOP_WORDS.contains(word)) continue; // ignore stop words

            meaningfulQueryWords++;

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

        if (meaningfulQueryWords > 0) {
            double coverage = (double) matchedWords / meaningfulQueryWords;
            score = (score * 0.7) + (coverage * 0.3);
        } else {
            return 0.0;
        }

        return Math.min(score, 1.0);
    }

    private String generateResponseText(String query, KnowledgeArticle article, double confidence) {
        if ("gemini".equalsIgnoreCase(aiProvider) && apiKey != null && !apiKey.isEmpty() && !apiKey.contains("demo-key")) {
            String prompt = "You are an AI customer support assistant. Based on this Knowledge Base article titled '" + article.getTitle() + "' with content:\n" + article.getContent() + "\n\nUser Question: " + query + "\n\nProvide a helpful, friendly, and concise support answer.";
            String geminiAnswer = callGeminiApi(prompt);
            if (geminiAnswer != null && !geminiAnswer.trim().isEmpty()) {
                return geminiAnswer + "\n\n*(Powered by Google Gemini)*";
            }
        }

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

    private String callGeminiApi(String prompt) {
        try {
            String targetModel = (aiModel != null && !aiModel.isEmpty()) ? aiModel : "gemini-1.5-flash";
            String urlString = "https://generativelanguage.googleapis.com/v1beta/models/" + targetModel + ":generateContent?key=" + apiKey;

            java.net.URL url = new java.net.URL(urlString);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String escapedPrompt = prompt.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
            String jsonInput = "{\"contents\":[{\"parts\":[{\"text\":\"" + escapedPrompt + "\"}]}]}";

            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInput.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int code = conn.getResponseCode();
            if (code == 200) {
                try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line.trim());
                    }
                    String raw = response.toString();
                    int textIdx = raw.indexOf("\"text\":");
                    if (textIdx != -1) {
                        String extracted = raw.substring(textIdx + 7).trim();
                        if (extracted.startsWith("\"")) {
                            extracted = extracted.substring(1);
                            int endQuote = extracted.indexOf("\"");
                            if (endQuote != -1) {
                                extracted = extracted.substring(0, endQuote);
                            }
                        }
                        return extracted.replace("\\n", "\n").replace("\\\"", "\"");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API call notice: " + e.getMessage());
        }
        return null;
    }

    private boolean isGreeting(String query) {
        if (query == null) return false;
        String clean = query.toLowerCase().replaceAll("[^a-z ]", "").trim();
        return clean.equals("hi") || clean.equals("hello") || clean.equals("hey") || 
               clean.equals("hi there") || clean.equals("hello there") || clean.equals("greetings") ||
               clean.equals("good morning") || clean.equals("good afternoon") || clean.equals("good evening") ||
               clean.equals("help") || clean.equals("hey there") || clean.equals("how are you") ||
               clean.equals("are you ok") || clean.equals("are you okay") || clean.equals("who are you") ||
               clean.equals("what is your name") || clean.equals("are you a bot") || clean.equals("are you ai") ||
               clean.equals("what can you do") || clean.equals("thank you") || clean.equals("thanks");
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
