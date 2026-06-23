package com.rungika.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Getter
@Setter
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String email;
    private long orderId;
    private Map<String, Integer> meals;
    private String status = "CREATED";
}
