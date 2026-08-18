package com.support.ai.service;

import com.support.ai.model.Ticket;
import com.support.ai.model.TicketMessage;
import com.support.ai.repository.TicketMessageRepository;
import com.support.ai.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;
    private final AiCopilotService aiCopilotService;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status.toUpperCase());
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Ticket createTicket(Ticket ticket) {
        // Run initial AI Copilot analysis to populate tags, sentiment, and summary
        AiCopilotService.CopilotAnalysis analysis = aiCopilotService.analyzeTicket(ticket, null);

        if (ticket.getPriority() == null || ticket.getPriority().isEmpty()) {
            ticket.setPriority(analysis.getSuggestedPriority());
        }
        if (ticket.getTags() == null || ticket.getTags().isEmpty()) {
            ticket.setTags(String.join(", ", analysis.getTags()));
        }
        ticket.setSentiment(analysis.getSentiment());
        ticket.setAiSummary(analysis.getSummary());

        Ticket savedTicket = ticketRepository.save(ticket);

        // Add initial message from customer
        TicketMessage initialMsg = TicketMessage.builder()
                .ticket(savedTicket)
                .senderType("CUSTOMER")
                .senderName(ticket.getCustomerName() != null ? ticket.getCustomerName() : ticket.getCustomerEmail())
                .content(ticket.getDescription())
                .build();
        messageRepository.save(initialMsg);

        return savedTicket;
    }

    public Ticket updateTicketStatus(Long id, String status, String agentName) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        ticket.setStatus(status.toUpperCase());
        if (agentName != null && !agentName.isEmpty()) {
            ticket.setAssignedAgent(agentName);
        }
        return ticketRepository.save(ticket);
    }

    public TicketMessage addMessage(Long ticketId, String senderType, String senderName, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        TicketMessage message = TicketMessage.builder()
                .ticket(ticket)
                .senderType(senderType.toUpperCase())
                .senderName(senderName)
                .content(content)
                .build();

        TicketMessage savedMsg = messageRepository.save(message);

        // If message is from agent, update ticket status to IN_PROGRESS if OPEN
        if ("AGENT".equalsIgnoreCase(senderType) && "OPEN".equalsIgnoreCase(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
            if (senderName != null && !senderName.isEmpty()) {
                ticket.setAssignedAgent(senderName);
            }
            ticketRepository.save(ticket);
        }

        return savedMsg;
    }

    public List<TicketMessage> getTicketMessages(Long ticketId) {
        return messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }
}
