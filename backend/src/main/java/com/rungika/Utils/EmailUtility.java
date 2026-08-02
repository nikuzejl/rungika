package com.rungika.Utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;

public class EmailUtility {

    @Value("${spring.mail.username}")
    static String emailSenderAddress;

    public static SimpleMailMessage createEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(emailSenderAddress);
        message.setSubject(subject);
        message.setText(content);
        return message;
    }

    public static SimpleMailMessage createTransferConfirmationEmail(String to, long orderId, String senderName,
                                                                     String recipientName, Double amount,
                                                                     String fromCurrency, Double convertedAmount,
                                                                     String toCurrency) {
        var subject = "Rungika Transfer Confirmation";
        var content = String.format("Dear %s,\n\n" +
                "Your transfer has been successfully completed!\n\n" +
                "Transfer Details:\n" +
                "Order ID: %d\n" +
                "You send: %s %s\n" +
                "Recipient (%s) receives: %s %s\n\n" +
                "Thank you for using Rungika for your remittance needs.\n\n" +
                "Best regards,\n" +
                "The Rungika Team",
                senderName, orderId, amount, fromCurrency, recipientName, convertedAmount, toCurrency);

        return createEmail(to, subject, content);
    }

    public static SimpleMailMessage createTransferNotificationEmail(String to, long orderId, String senderName,
                                                                     Double amount, String toCurrency) {
        var subject = "Rungika Money Transfer Received";
        var content = String.format("Dear Recipient,\n\n" +
                "Good news! You have received a transfer from %s.\n\n" +
                "Transfer Details:\n" +
                "Order ID: %d\n" +
                "Amount: %s %s\n\n" +
                "Thank you for using Rungika.\n\n" +
                "Best regards,\n" +
                "The Rungika Team",
                senderName, orderId, amount, toCurrency);

        return createEmail(to, subject, content);
    }

    public static SimpleMailMessage createPasswordResetEmail(String to, String resetLink) {
        var subject = "Reset your Rungika password";
        var content = "We received a request to reset your password.\n\n"
                + "Use this secure link to set a new password:\n"
                + resetLink
                + "\n\n"
                + "This link will expire in 30 minutes. If you did not request this, you can ignore this email.";

        return createEmail(to, subject, content);
    }

    public static SimpleMailMessage createOrderStatusUpdateEmail(
        String to,
        long orderId,
        String status,
        String senderName,
        String recipientName,
        String adminNote,
        String adminPhoto
    ) {
    var subject = "Order Update #" + orderId + " - " + status;
    String noteLine = (adminNote != null && !adminNote.isBlank())
        ? "\nAdmin note: " + adminNote.trim()
        : "";
    String photoLine = (adminPhoto != null && !adminPhoto.isBlank())
        ? "\nPhoto reference: " + adminPhoto.trim()
        : "";

    var content = String.format("Hello,\n\n" +
            "Order %d has been updated to status: %s.\n" +
            "Sender: %s\n" +
            "Recipient: %s%s%s\n\n" +
            "Thank you,\n" +
            "Rungika Team",
        orderId,
        status,
        senderName == null ? "" : senderName,
        recipientName == null ? "" : recipientName,
        noteLine,
        photoLine);

    return createEmail(to, subject, content);
    }
}
