package com.support.ai.config;

import com.support.ai.model.KnowledgeArticle;
import com.support.ai.model.Ticket;
import com.support.ai.model.TicketMessage;
import com.support.ai.repository.KnowledgeArticleRepository;
import com.support.ai.repository.TicketMessageRepository;
import com.support.ai.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final KnowledgeArticleRepository articleRepository;
    private final TicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;

    @Override
    public void run(String... args) throws Exception {
        if (articleRepository.count() == 0) {
            seedKnowledgeBase();
        }
        if (ticketRepository.count() == 0) {
            seedTickets();
        }
    }

    private void seedKnowledgeBase() {
        articleRepository.saveAll(Arrays.asList(
            KnowledgeArticle.builder()
                .title("How to Reset Your Account Password")
                .category("Authentication")
                .tags("Password, Login, Reset, Security, 2FA")
                .content("To reset your password:\n1. Click on 'Forgot Password' on the login screen.\n2. Enter your registered email address.\n3. Check your inbox for a password reset token link.\n4. Click the link and enter a new password (min 8 chars, 1 number, 1 special symbol).\n5. If you do not receive an email within 5 minutes, check your Spam folder or contact support.")
                .isPublished(true)
                .viewsCount(342)
                .helpfulVotes(48)
                .unhelpfulVotes(2)
                .build(),

            KnowledgeArticle.builder()
                .title("Managing Subscription & Billing Invoices")
                .category("Billing")
                .tags("Billing, Subscription, Credit Card, Invoice, Upgrade, Payment")
                .content("You can view and download past billing invoices under Account Settings > Billing & Payments.\n\nTo change your active plan:\n- Navigate to Plan & Usage.\n- Select Upgrade/Downgrade.\n- Changes to monthly subscriptions take effect immediately with prorated billing.\n- Accepted payment methods: Visa, Mastercard, American Express, PayPal.")
                .isPublished(true)
                .viewsCount(210)
                .helpfulVotes(35)
                .unhelpfulVotes(1)
                .build(),

            KnowledgeArticle.builder()
                .title("API Key Generation & Rate Limits")
                .category("API & Integration")
                .tags("API, Developer, Webhook, Rate Limit, Auth Token, Bearer")
                .content("Standard API access supports up to 1,000 requests per minute per IP.\n\nTo generate an API key:\n1. Go to Developer Settings > API Keys.\n2. Click 'Generate New Secret Key'.\n3. Copy and securely store your key (it will only be shown once).\n4. Authenticate HTTP requests with header: 'Authorization: Bearer YOUR_API_KEY'.")
                .isPublished(true)
                .viewsCount(185)
                .helpfulVotes(29)
                .unhelpfulVotes(3)
                .build(),

            KnowledgeArticle.builder()
                .title("Refund Policy & Requesting Cancellation")
                .category("Billing")
                .tags("Refund, Cancel, Subscription, Money-back, Terms")
                .content("We offer a 14-day full refund guarantee for all new annual subscriptions.\n\nTo request a refund:\n- Contact customer support within 14 days of purchase.\n- Provide your subscription invoice ID.\n- Refunds are processed to your original payment method within 3-5 business days.")
                .isPublished(true)
                .viewsCount(120)
                .helpfulVotes(19)
                .unhelpfulVotes(4)
                .build()
        ));
    }

    private void seedTickets() {
        Ticket t1 = Ticket.builder()
                .title("Unable to reset password via email link")
                .description("I tried clicking the password reset link sent to my email john@example.com, but it keeps throwing an expired token error.")
                .customerEmail("john.doe@example.com")
                .customerName("John Doe")
                .priority("HIGH")
                .status("OPEN")
                .category("Authentication")
                .tags("Authentication, Password")
                .sentiment("FRUSTRATED")
                .aiSummary("Customer reported expired token error when clicking reset link in password email.")
                .resolvedByAi(false)
                .build();
        t1 = ticketRepository.save(t1);

        messageRepository.save(TicketMessage.builder()
                .ticket(t1)
                .senderType("CUSTOMER")
                .senderName("John Doe")
                .content("I tried clicking the password reset link sent to my email john@example.com, but it keeps throwing an expired token error.")
                .build());

        Ticket t2 = Ticket.builder()
                .title("Invoice receipt query for July subscription")
                .description("Need an itemized VAT invoice for our company tax filing for July 2026.")
                .customerEmail("sarah.tech@acme.org")
                .customerName("Sarah Jenkins")
                .priority("LOW")
                .status("RESOLVED")
                .category("Billing")
                .tags("Billing, Invoice")
                .sentiment("NEUTRAL")
                .aiSummary("Customer requested itemized VAT invoice for tax filing.")
                .resolvedByAi(true)
                .assignedAgent("AI Bot")
                .build();
        t2 = ticketRepository.save(t2);

        messageRepository.save(TicketMessage.builder()
                .ticket(t2)
                .senderType("CUSTOMER")
                .senderName("Sarah Jenkins")
                .content("Need an itemized VAT invoice for our company tax filing for July 2026.")
                .build());

        messageRepository.save(TicketMessage.builder()
                .ticket(t2)
                .senderType("AI_ASSISTANT")
                .senderName("AI Support Copilot")
                .content("Hi Sarah! You can automatically download itemized VAT invoices directly under Account Settings > Billing & Payments. I have also attached invoice #INV-2026-07 to this ticket!")
                .build());

        Ticket t3 = Ticket.builder()
                .title("API Webhook signature validation failing")
                .description("Our webhook endpoint receives 401 response during HMAC-SHA256 signature verification. Is header format standard?")
                .customerEmail("alex.dev@startup.io")
                .customerName("Alex Rivera")
                .priority("URGENT")
                .status("IN_PROGRESS")
                .category("API & Integration")
                .tags("API & Dev, Security")
                .sentiment("URGENT")
                .aiSummary("Developer reported HMAC signature verification failure on API webhooks.")
                .resolvedByAi(false)
                .assignedAgent("Marcus Vance (Senior Support)")
                .build();
        t3 = ticketRepository.save(t3);

        messageRepository.save(TicketMessage.builder()
                .ticket(t3)
                .senderType("CUSTOMER")
                .senderName("Alex Rivera")
                .content("Our webhook endpoint receives 401 response during HMAC-SHA256 signature verification. Is header format standard?")
                .build());

        messageRepository.save(TicketMessage.builder()
                .ticket(t3)
                .senderType("AGENT")
                .senderName("Marcus Vance")
                .content("Hi Alex! Ensure your secret key is UTF-8 encoded before computing the SHA256 digest. Let me verify our sample Python/Node snippets for you.")
                .build());
    }
}
