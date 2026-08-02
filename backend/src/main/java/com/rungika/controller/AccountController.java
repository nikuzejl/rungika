package com.rungika.controller;

import com.rungika.config.security.services.UserDetailsImpl;
import com.rungika.entity.Order;
import com.rungika.entity.User;
import com.rungika.payload.request.PasswordChangeRequest;
import com.rungika.payload.response.MessageResponse;
import com.rungika.repository.UserRepository;
import com.rungika.service.OrderService;
import com.rungika.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam String email) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Email is required"));
            }

            List<Order> orders = orderService.getOrdersByEmail(email);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error retrieving orders: " + e.getMessage()));
        }
    }

    /**
     * Delete user account and all associated data
     */
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount(@RequestParam String email) {
        try {
            // Verify user is authenticated
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Email is required"));
            }

            // Delete user and associated data
            userService.deleteUserAndAssociatedData(email);

            return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting account: " + e.getMessage()));
        }
    }

    /**
     * Change user password
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
        try {
            // Verify user is authenticated
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            String userEmail = request.getEmail();
            if (userEmail == null || userEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Email is required"));
            }

            Optional<User> userOptional = userRepository.findByEmail(userEmail);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("User not found"));
            }

            User user = userOptional.get();

            // Verify current password
            if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Current password is incorrect"));
            }

            // Validate new password
            if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("New password must be at least 6 characters long"));
            }

            // Update password
            user.setPassword(encoder.encode(request.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error changing password: " + e.getMessage()));
        }
    }
}
