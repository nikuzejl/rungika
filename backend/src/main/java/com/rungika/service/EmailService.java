package com.rungika.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${email.notification.enabled}")
    private boolean notificationEnabled;

    public void sendEmail(SimpleMailMessage email) {
        if (notificationEnabled)
            javaMailSender.send(email);
    }
}

