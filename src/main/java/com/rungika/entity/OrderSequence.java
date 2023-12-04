package com.rungika.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "order_sequences")
public class OrderSequence {
    @Id
    private String id;
    private String orderType;
    private long sequenceValue;
}
