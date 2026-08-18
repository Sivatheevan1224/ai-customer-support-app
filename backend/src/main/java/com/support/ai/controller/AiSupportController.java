package com.support.ai.controller;

import com.support.ai.model.Ticket;
import com.support.ai.model.TicketMessage;
import com.support.ai.service.AiCopilotService;
import com.support.ai.service.RAGSearchEngineService;
import com.support.ai.service.TicketService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiSupportController {

    private final RAGSearchEngineService ragSearchEngineService;
    private final AiCopilotService aiCopilotService;
    private final TicketService ticketService;

    @PostMapping("/chat")
    public ResponseEntity<RAGSearchEngineService.RAGResult> askAiChatbot(@RequestBody ChatRequest request) {
        RAGSearchEngineService.RAGResult result = ragSearchEngineService.processCustomerQuery(request.getMessage());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/copilot/analyze/{ticketId}")
    public ResponseEntity<AiCopilotService.CopilotAnalysis> analyzeTicket(@PathVariable Long ticketId) {
        Ticket ticket = ticketService.getTicketById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        List<TicketMessage> messages = ticketService.getTicketMessages(ticketId);
        AiCopilotService.CopilotAnalysis analysis = aiCopilotService.analyzeTicket(ticket, messages);
        return ResponseEntity.ok(analysis);
    }

    @Data
    public static class ChatRequest {
        private String message;
        private String customerEmail;
    }
}
