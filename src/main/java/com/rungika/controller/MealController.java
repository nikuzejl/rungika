package com.rungika.controller;

import com.rungika.entity.Meal;
import com.rungika.service.MealService;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/meal")
public class MealController {
    @Autowired
    private MealService mealService;

    @GetMapping("/getAll")
    public List<Meal> getAllMeals() {
        return mealService.findAll();
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveMeal(
            @RequestParam("meal") String meal,
            @RequestParam("restaurant") String restaurant,
            @RequestParam("ingredients") List<String> ingredients,
            @RequestParam("price") double price,
            @RequestParam("image") MultipartFile file) throws IOException {
        Document document = new Document();
        document.append("meal", meal);
        document.append("restaurant", restaurant);
        document.append("ingredients", ingredients);
        document.append("price", price);
        Document imgDoc = new Document();
        imgDoc.append("name", file.getOriginalFilename());
        imgDoc.append("data", file.getBytes());
        imgDoc.append("type", file.getContentType());
        document.append("image", imgDoc);

        mealService.saveMeal(meal, Objects.toString(Math.random() * 100), restaurant, ingredients, Objects.toString(price), imgDoc);
        return new ResponseEntity<>("Meal saved successfully", HttpStatus.OK);
    }

    @GetMapping("/{restaurant}")
    public Optional<List<Meal>> getMealPerRestaurant(@PathVariable("restaurant") String restaurant) {
        return mealService.findAllByRestaurant(restaurant);
    }
}