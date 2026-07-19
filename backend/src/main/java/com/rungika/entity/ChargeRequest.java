package com.rungika.entity;

import lombok.Data;

@Data
public class ChargeRequest {
    public enum Currency {
        //Todo: Add more currencies as needed
        USD, CAD;
    }

    private String description;
    private int amount;
    private Currency currency;
    private String stripeEmail;
    private String stripeToken;
}