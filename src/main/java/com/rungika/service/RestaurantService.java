package com.rungika.service;

import com.rungika.entity.Restaurant;
import com.rungika.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Restaurant saveRestaurant(String name, String email, String address, String phone, Object image) {
        Restaurant newRestaurant = new Restaurant(name, email, address, phone, image);
        return restaurantRepository.save(newRestaurant);
    }

    public List<Restaurant> findAll() {
        return restaurantRepository.findAll();
    }
}
