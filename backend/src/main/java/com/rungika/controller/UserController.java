package com.rungika.controller;

import com.rungika.entity.User;
import com.rungika.repository.UserRepository;
import com.rungika.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("currently/unuseddddd/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        try {
            userService.createUser(user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword());
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Email already taken. Login or use a different email");
        }
    }

    @DeleteMapping("/delete")
    public String deleteUserByEmail(@RequestParam String email) {
        if (userRepository.existsByEmail(email)) {
            userService.deleteUserAndAssociatedData(email);
            return "User with email " + email + " has been deleted.";
        } else {
            return "User with email " + email + " does not exist.";
        }
    }
}
