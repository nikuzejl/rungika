package com.rungika.Utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;

import java.util.Base64;

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
                "Your transfer has been successfully sent! We are working on delivering the funds soon, and will notify you when it is completed.\n\n" +
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
        var subject = "Rungika Money Transfer PENDING";
        var content = String.format("Hello,\n\n" +
                "Good news! You have received a transfer from %s.\n\n" +
                "Transfer Details:\n" +
                "Order ID: %d\n" +
                "Amount: %s %s\n\n" +
                "We are working on it, and will notified soon when it coompleted.\n\n" +
                "Best regards,\n" +
                "The Rungika Team",
                senderName, orderId, amount, toCurrency);

        return createEmail(to, subject, content);
    }

    public static SimpleMailMessage createAdminTransactionNotificationEmail(String[] to, long orderId,
                                                                              String senderName,
                                                                              String recipientName,
                                                                              Double amount,
                                                                              String fromCurrency,
                                                                              Double convertedAmount,
                                                                              String toCurrency) {
        var subject = "Rungika New Transaction #" + orderId;
        var content = String.format("Hello Admin,\n\n" +
                "Somebody just made a transaction on Rungika.\n\n" +
                "Transaction Details:\n" +
                "Order ID: %d\n" +
                "Sender: %s\n" +
                "Recipient: %s\n" +
                "Amount sent: %s %s\n" +
                "Amount received: %s %s\n\n" +
                "The order is pending admin review.\n\n" +
                "Rungika Team",
                orderId, senderName, recipientName, amount, fromCurrency, convertedAmount, toCurrency);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        return message;
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
        ? "\nNotes: " + adminNote.trim()
        : "";

    var content = String.format("Hello,\n\n" +
            "Order %d has been updated to status: %s.\n" +
            "Sender: %s\n" +
            "Recipient: %s%s\n\n" +
            "Thank you,\n" +
            "Rungika Team",
        orderId,
        status,
        senderName == null ? "" : senderName,
        recipientName == null ? "" : recipientName,
        noteLine);

    return createEmail(to, subject, content);
    }

    public static AttachmentEmail createOrderStatusUpdateEmailWithPhoto(
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
            ? "\nNotes: " + adminNote.trim()
            : "";

        var content = String.format("Hello,\n\n" +
                "Order %d has been updated to status: %s.\n" +
                "Sender: %s\n" +
                "Recipient: %s%s\n\n" +
                "Evidence documents attached to this email.\n\n" +
                "Thank you,\n" +
                "Rungika Team",
            orderId,
            status,
            senderName == null ? "" : senderName,
            recipientName == null ? "" : recipientName,
            noteLine);

        AttachmentData attachmentData = parsePhotoAttachment(adminPhoto, orderId);
        return new AttachmentEmail(to, subject, content, attachmentData);
    }

    private static AttachmentData parsePhotoAttachment(String photo, long orderId) {
        if (photo == null || photo.isBlank()) {
            return null;
        }

        String trimmedPhoto = photo.trim();
        String mimeType = "image/png";
        String base64Content = trimmedPhoto;

        if (trimmedPhoto.startsWith("data:")) {
            int separatorIndex = trimmedPhoto.indexOf(",");
            if (separatorIndex > 0) {
                String metadata = trimmedPhoto.substring(5, separatorIndex);
                base64Content = trimmedPhoto.substring(separatorIndex + 1);

                int mimeEndIndex = metadata.indexOf(';');
                if (mimeEndIndex > 0) {
                    mimeType = metadata.substring(0, mimeEndIndex);
                } else if (!metadata.isBlank()) {
                    mimeType = metadata;
                }
            }
        }

        try {
            byte[] bytes = Base64.getDecoder().decode(base64Content);
            String extension = mimeType.contains("/") ? mimeType.substring(mimeType.indexOf('/') + 1) : "png";
            String safeExtension = extension.isBlank() ? "png" : extension;
            return new AttachmentData(bytes, mimeType, "order-" + orderId + "-admin-photo." + safeExtension);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    public static class AttachmentEmail {
        private final String to;
        private final String subject;
        private final String content;
        private final AttachmentData attachmentData;

        public AttachmentEmail(String to, String subject, String content, AttachmentData attachmentData) {
            this.to = to;
            this.subject = subject;
            this.content = content;
            this.attachmentData = attachmentData;
        }

        public String getTo() {
            return to;
        }

        public String getSubject() {
            return subject;
        }

        public String getContent() {
            return content;
        }

        public AttachmentData getAttachmentData() {
            return attachmentData;
        }
    }

    public static class AttachmentData {
        private final byte[] bytes;
        private final String mimeType;
        private final String filename;

        public AttachmentData(byte[] bytes, String mimeType, String filename) {
            this.bytes = bytes;
            this.mimeType = mimeType;
            this.filename = filename;
        }

        public byte[] getBytes() {
            return bytes;
        }

        public String getMimeType() {
            return mimeType;
        }

        public String getFilename() {
            return filename;
        }
    }
}
