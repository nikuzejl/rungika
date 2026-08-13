package com.rungika.service;

import com.rungika.Utils.EmailUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final long RESEND_SEND_TIMEOUT_MILLIS = 5000L;
    private final ExecutorService emailExecutor = Executors.newCachedThreadPool(r -> {
        Thread thread = new Thread(r, "email-send");
        thread.setDaemon(true);
        return thread;
    });

    private final RestClient resendRestClient;
    private final boolean notificationEnabled;
    private final String resendApiKey;
    private final String defaultFromAddress;

    public EmailService(
            RestClient resendRestClient,
            @Value("${email.notification.enabled}") boolean notificationEnabled,
            @Value("${resend.api-key:}") String resendApiKey,
            @Value("${resend.from-email:onboarding@resend.dev}") String defaultFromAddress) {
        this.resendRestClient = resendRestClient;
        this.notificationEnabled = notificationEnabled;
        this.resendApiKey = resendApiKey;
        this.defaultFromAddress = defaultFromAddress;
    }

    @Async
    public CompletableFuture<Boolean> sendEmail(SimpleMailMessage email) {
        if (email == null) {
            logger.error("Email send failed: message is null");
            return CompletableFuture.completedFuture(false);
        }

        if (email.getReplyTo() == null || email.getReplyTo().isEmpty()) {
            email.setReplyTo(defaultFromAddress);
        }

        String to = email.getTo() == null ? "[]" : String.join(", ", email.getTo());
        String subject = email.getSubject() == null ? "(no subject)" : email.getSubject();

        if (notificationEnabled) {
            try {
                logger.info("Sending email to [{}] with subject [{}] via Resend", to, subject);
                boolean sent = executeWithTimeout(() -> sendWithResend(
                    email.getTo(), email.getSubject(), email.getText(), email.getReplyTo(), List.of()
                ), RESEND_SEND_TIMEOUT_MILLIS, TimeUnit.MILLISECONDS, to, subject, "Resend");
                if (!sent) {
                    throw new IllegalStateException("Resend send timed out for " + to);
                }
                logger.info("Email sent to [{}] with subject [{}] via Resend", to, subject);
                return CompletableFuture.completedFuture(true);
            } catch (RuntimeException ex) {
                logger.error("Email send failed to [{}] with subject [{}]: {}", to, subject, ex.getMessage(), ex);
                return CompletableFuture.completedFuture(false);
            }
        }

        logger.info("Email notification disabled. Skipped email to [{}] with subject [{}]", to, subject);
        return CompletableFuture.completedFuture(true);
    }

    @Async
    public CompletableFuture<Boolean> sendEmail(EmailUtility.AttachmentEmail email) {
        if (email == null) {
            logger.error("Email send failed: message is null");
            return CompletableFuture.completedFuture(false);
        }

        String to = email.getTo() == null ? "[]" : email.getTo();
        String subject = email.getSubject() == null ? "(no subject)" : email.getSubject();

        if (notificationEnabled) {
            try {
                logger.info("Sending multipart email to [{}] with subject [{}] via Resend", to, subject);
                List<Map<String, String>> attachments = new ArrayList<>();
                if (email.getAttachmentData() != null && email.getAttachmentData().getBytes() != null) {
                    attachments.add(Map.of(
                        "filename", email.getAttachmentData().getFilename(),
                        "content", Base64.getEncoder().encodeToString(email.getAttachmentData().getBytes())
                    ));
                }
                boolean sent = executeWithTimeout(() -> sendWithResend(
                    new String[]{email.getTo()}, email.getSubject(), email.getContent(), defaultFromAddress, attachments
                ), RESEND_SEND_TIMEOUT_MILLIS, TimeUnit.MILLISECONDS, to, subject, "Resend");
                if (!sent) {
                    throw new IllegalStateException("Resend multipart send timed out for " + to);
                }
                logger.info("Multipart email sent to [{}] with subject [{}] via Resend", to, subject);
                return CompletableFuture.completedFuture(true);
            } catch (RuntimeException ex) {
                logger.error("Multipart email send failed to [{}] with subject [{}]: {}", to, subject, ex.getMessage(), ex);
                return CompletableFuture.completedFuture(false);
            }
        }

        logger.info("Email notification disabled. Skipped multipart email to [{}] with subject [{}]", to, subject);
        return CompletableFuture.completedFuture(true);
    }

    private boolean sendWithResend(
            String[] recipients,
            String subject,
            String content,
            String replyTo,
            List<Map<String, String>> attachments) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("Resend API key is not configured");
        }

        Map<String, Object> request = new HashMap<>();
        request.put("from", defaultFromAddress);
        request.put("to", recipients == null ? List.of() : List.of(recipients));
        request.put("subject", subject == null ? "" : subject);
        request.put("text", content == null ? "" : content);
        request.put("reply_to", replyTo);
        if (!attachments.isEmpty()) {
            request.put("attachments", attachments);
        }

        resendRestClient.post()
                .uri("/emails")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toBodilessEntity();
        return true;
    }

    boolean executeWithTimeout(Callable<Boolean> action, long timeout, TimeUnit unit, String to, String subject, String provider) {
        Future<Boolean> future = emailExecutor.submit(action);
        try {
            return future.get(timeout, unit);
        } catch (TimeoutException ex) {
            future.cancel(true);
            logger.warn("Timed out after {} {} while sending email to [{}] with subject [{}] via {}", timeout, unit, to, subject, provider);
            return false;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            logger.warn("Interrupted while sending email to [{}] with subject [{}] via {}", to, subject, provider);
            return false;
        } catch (ExecutionException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof RuntimeException) {
                throw (RuntimeException) cause;
            }
            throw new IllegalStateException("Email send failed", cause);
        }
    }
}
