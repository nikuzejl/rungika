package com.rungika.repository;

import com.rungika.entity.Meal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealRepository extends MongoRepository<Meal, String> {
    Optional<Meal> findByMealId(String mealId);

    Optional<List<Meal>> findAllByRestaurant(String restaurant);

    void deleteByMealId(String mealId);
}

