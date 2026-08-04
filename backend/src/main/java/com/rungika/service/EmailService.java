package com.rungika.service;

import com.rungika.Utils.EmailUtility;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${email.notification.enabled}")
    private boolean notificationEnabled;

    @Async
    public void sendEmail(SimpleMailMessage email) {
        if (email == null) {
            logger.error("Email send failed: message is null");
            throw new IllegalArgumentException("Email message must not be null");
        }

        String to = email.getTo() == null ? "[]" : String.join(", ", email.getTo());
        String subject = email.getSubject() == null ? "(no subject)" : email.getSubject();

        if (notificationEnabled) {
            try {
                logger.info("Sending email to [{}] with subject [{}]", to, subject);
                javaMailSender.send(email);
                logger.info("Email sent to [{}] with subject [{}]", to, subject);
            } catch (MailException ex) {
                logger.error("Email send failed to [{}] with subject [{}]: {}", to, subject, ex.getMessage(), ex);
            }
            return;
        }

        logger.info("Email notification disabled. Skipped email to [{}] with subject [{}]", to, subject);
    }

    @Async
    public void sendEmail(EmailUtility.AttachmentEmail email) {
        if (email == null) {
            logger.error("Email send failed: message is null");
            throw new IllegalArgumentException("Email message must not be null");
        }

        String to = email.getTo() == null ? "[]" : email.getTo();
        String subject = email.getSubject() == null ? "(no subject)" : email.getSubject();

        if (notificationEnabled) {
            try {
                logger.info("Sending multipart email to [{}] with subject [{}]", to, subject);
                var mimeMessage = javaMailSender.createMimeMessage();
                var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(email.getTo());
                helper.setSubject(email.getSubject());
                helper.setText(email.getContent(), false);

                if (email.getAttachmentData() != null && email.getAttachmentData().getBytes() != null) {
                    helper.addAttachment(
                        email.getAttachmentData().getFilename(),
                        new ByteArrayResource(email.getAttachmentData().getBytes()),
                        email.getAttachmentData().getMimeType()
                    );
                }

                javaMailSender.send(mimeMessage);
                logger.info("Multipart email sent to [{}] with subject [{}]", to, subject);
            } catch (MailException | MessagingException ex) {
                logger.error("Multipart email send failed to [{}] with subject [{}]: {}", to, subject, ex.getMessage(), ex);
            }
            return;
        }

        logger.info("Email notification disabled. Skipped multipart email to [{}] with subject [{}]", to, subject);
    }
}
