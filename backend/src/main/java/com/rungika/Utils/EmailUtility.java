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

    public static SimpleMailMessage createdOrderSentEmail(String to, long orderId, String trackingLink) {
        var subject = "Order #" + orderId;
        var content = String.format("Dear customer,\n\n" +
                "Thanks for placing your order %s. We are on it and we will let you know when it is completed.\n" +
                "Meanwhile, you can track your order here ", orderId, trackingLink);

        return createEmail(to, subject, content);
    }

    public static SimpleMailMessage createdOrderCancelledEmail(String to, long orderId) {
        var subject = "Order #" + orderId;
        var content = String.format("Dear customer,\n\n" +
                "Your order %s has been cancelled ", orderId);

        return createEmail(to, subject, content);
    }

    public static SimpleMailMessage createTransferConfirmationEmail(String to, long orderId, String senderName,
                                                                     String recipientName, Double amount,
                                                                     String fromCurrency, Double convertedAmount,
                                                                     String toCurrency) {
        var subject = "Transfer Confirmation #" + orderId;
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
        var subject = "Money Transfer Received #" + orderId;
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
}
