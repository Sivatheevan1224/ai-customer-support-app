package com.support.ai.controller;

import com.support.ai.model.Ticket;
import com.support.ai.model.TicketMessage;
import com.support.ai.service.TicketService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
        }
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(ticket));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long id, 
                                               @RequestParam String status, 
                                               @RequestParam(required = false) String agentName) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, agentName));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<TicketMessage>> getTicketMessages(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketMessages(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<TicketMessage> addMessage(@PathVariable Long id, @RequestBody MessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addMessage(id, request.getSenderType(), request.getSenderName(), request.getContent()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class MessageRequest {
        private String senderType; // CUSTOMER, AGENT, AI_ASSISTANT
        private String senderName;
        private String content;
    }
}
