package com.rungika.service;

import com.rungika.entity.User;
import com.rungika.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(String firstName, String lastName, String email, String phone, String password) throws Exception {
        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email already taken");
        }

        String hashedPassword = passwordEncoder.encode(password);
        User newUser = new User();
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setEmail(email);
        newUser.setPhone(phone);
        newUser.setPassword(hashedPassword);
        return userRepository.save(newUser);
    }

    public void deleteUserAndAssociatedData(String userEmail) {
        userRepository.deleteByEmail(userEmail);
        deleteAssociatedDataFromCollection("orders", userEmail);
    }

    private void deleteAssociatedDataFromCollection(String collectionName, String userEmail) {
        Query query = new Query(Criteria.where("email").is(userEmail));
        mongoTemplate.remove(query, collectionName);
    }
}
