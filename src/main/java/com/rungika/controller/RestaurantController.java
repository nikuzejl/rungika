package com.rungika.controller;

import com.rungika.entity.Restaurant;
import com.rungika.service.RestaurantService;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurant")
public class RestaurantController {
    @Autowired
    private RestaurantService restaurantService;

    @GetMapping("/getAll")
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.findAll();
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveRestaurant(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("address") String address,
            @RequestParam("phone") String phone,
            @RequestParam("image") MultipartFile file) throws IOException {
        Document document = new Document();
        document.append("name", name);
        document.append("email", email);
        document.append("address", address);
        document.append("phone", phone);
        Document imgDoc = new Document();
        imgDoc.append("name", file.getOriginalFilename());
        imgDoc.append("data", file.getBytes());
        imgDoc.append("type", file.getContentType());
        document.append("image", imgDoc);

        restaurantService.saveRestaurant(name, email, address, phone, imgDoc);
        return new ResponseEntity<>("Form submitted successfully", HttpStatus.OK);
    }
}