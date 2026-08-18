package com.support.ai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummary {
    private long totalTickets;
    private long openTickets;
    private long resolvedTickets;
    private long totalKnowledgeArticles;
    private double aiDeflectionRate; // Percentage of issues resolved by AI chatbot
    private double avgResolutionTimeHours;
    private double customerSatisfactionScore; // Out of 5.0
    private Map<String, Long> ticketsByStatus;
    private Map<String, Long> ticketsByPriority;
    private Map<String, Long> ticketsByCategory;
}
