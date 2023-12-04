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
}
