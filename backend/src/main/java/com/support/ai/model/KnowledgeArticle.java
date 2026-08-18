package com.support.ai.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String category;

    private String tags; // Comma separated tags e.g. "Billing, Account, Password"

    @Column(nullable = false)
    private Boolean isPublished = true;

    private Integer viewsCount = 0;

    private Integer helpfulVotes = 0;

    private Integer unhelpfulVotes = 0;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (viewsCount == null) viewsCount = 0;
        if (helpfulVotes == null) helpfulVotes = 0;
        if (unhelpfulVotes == null) unhelpfulVotes = 0;
        if (isPublished == null) isPublished = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
