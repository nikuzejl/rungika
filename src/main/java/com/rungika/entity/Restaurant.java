package com.rungika.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "restaurants")
public class Restaurant {
    @Id
    private String id;
    private String name;
    private String email;
    private String address;
    private String phone;
    private Object image;

    public Restaurant(String name, String email, String address, String phone, Object image) {
        this.name = name;
        this.email = email;
        this.address = address;
        this.phone = phone;
        this.image = image;
    }
}