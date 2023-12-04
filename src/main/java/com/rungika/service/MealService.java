package com.rungika.service;

import com.rungika.entity.Meal;
import com.rungika.repository.MealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MealService {

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Meal saveMeal(String name, String mealId, String restaurant, List<String> ingredients, String price, Object image) {
        Meal newMeal = new Meal(name, mealId, restaurant, ingredients, price, image);
        return mealRepository.save(newMeal);
    }

    public List<Meal> findAll() {
        return mealRepository.findAll();
    }

    public Optional<List<Meal>> findAllByRestaurant(String restaurant) {
        return mealRepository.findAllByRestaurant(restaurant);
    }
}
