package com.rungika.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Setter
@Document(collection = "meals")
public class Meal {
    @Id
    private String id;
    private String name;
    private String mealId;
    private String restaurant;
    private List<String> ingredients;
    private Object image;
    private String price;

    public Meal(String name, String mealId, String restaurant, List<String> ingredients, String price, Object image) {
        this.name = name;
        this.mealId = mealId;
        this.restaurant = restaurant;
        this.ingredients = ingredients;
        this.price = price;
        this.image = image;
    }
}