package com.rungika.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String email;
    @Indexed(unique = true)
    private long orderId;
    private String status = "CREATED";
    private String sessionId;
    private Instant transactionTime;

    private String senderFirstName;
    private String senderLastName;
    private String senderEmail;
    private String senderPhone;

    private String recipientFirstName;
    private String recipientLastName;
    private String recipientEmail;
    private String recipientPhone;

    private Double amount;
    private String fromCurrency;
    private Double convertedAmount;
    private String toCurrency;
    private String receiveMethod;
    private String recipientBankName;
    private String recipientAccountNumber;
    private String deliveryChannel;

    private String adminStatusNote;
    private String adminStatusPhoto;
    private String lastUpdatedByAdminEmail;
    private Instant statusUpdatedAt;
}
