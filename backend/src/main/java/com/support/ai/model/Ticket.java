package com.support.ai.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String customerEmail;

    private String customerName;

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @Column(nullable = false)
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    private String category; // Technical, Billing, General, Feature Request

    private String tags; // Comma separated auto-tags from AI

    private String sentiment; // POSITIVE, NEUTRAL, FRUSTRATED, URGENT

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    private Boolean resolvedByAi = false;

    private String assignedAgent;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TicketMessage> messages = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (priority == null) priority = "MEDIUM";
        if (status == null) status = "OPEN";
        if (resolvedByAi == null) resolvedByAi = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
