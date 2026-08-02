package com.rungika.controller;

import com.rungika.Utils.EmailUtility;
import com.rungika.config.security.services.UserDetailsImpl;
import com.rungika.entity.Order;
import com.rungika.payload.request.AdminOrderStatusUpdateRequest;
import com.rungika.service.AdminAuthorizationService;
import com.rungika.service.EmailService;
import com.rungika.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private AdminAuthorizationService adminAuthorizationService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/pending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPendingOrders(Authentication authentication) {
        String adminEmail = resolveCurrentEmail(authentication);
        if (!adminAuthorizationService.canManageOrders(authentication, adminEmail)) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: admin privileges required."));
        }

        return ResponseEntity.ok(orderService.getPendingOrdersForAdmin());
    }

    @GetMapping("/failed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getFailedOrders(Authentication authentication) {
        String adminEmail = resolveCurrentEmail(authentication);
        if (!adminAuthorizationService.canManageOrders(authentication, adminEmail)) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: admin privileges required."));
        }

        return ResponseEntity.ok(orderService.getOrdersByStatus("FAILED"));
    }

    @GetMapping("/completed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCompletedOrders(Authentication authentication) {
        String adminEmail = resolveCurrentEmail(authentication);
        if (!adminAuthorizationService.canManageOrders(authentication, adminEmail)) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: admin privileges required."));
        }

        return ResponseEntity.ok(orderService.getOrdersByStatus("COMPLETED"));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateOrderStatus(
            Authentication authentication,
            @PathVariable long orderId,
            @RequestBody AdminOrderStatusUpdateRequest request
    ) {
        String adminEmail = resolveCurrentEmail(authentication);
        if (!adminAuthorizationService.canManageOrders(authentication, adminEmail)) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: admin privileges required."));
        }

        try {
            Order updatedOrder = orderService.updateOrderStatusByAdmin(
                    orderId,
                    request.getStatus(),
                    adminEmail,
                    request.getNote(),
                    request.getPhoto()
            );

            notifyStatusUpdate(updatedOrder);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order updated successfully.");
            response.put("order", updatedOrder);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to update order."));
        }
    }

    private String resolveCurrentEmail(Authentication authentication) {
        if (authentication == null) {
            return "";
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl userDetails) {
            return userDetails.getEmail();
        }

        return authentication.getName() == null ? "" : authentication.getName();
    }

    private void notifyStatusUpdate(Order order) {
        String senderEmail = order.getSenderEmail();
        if (senderEmail != null && !senderEmail.isBlank()) {
            var senderMail = EmailUtility.createOrderStatusUpdateEmail(
                    senderEmail,
                    order.getOrderId(),
                    order.getStatus(),
                    order.getSenderFirstName(),
                    order.getRecipientFirstName(),
                    order.getAdminStatusNote(),
                    order.getAdminStatusPhoto()
            );
            emailService.sendEmail(senderMail);
        }

        String recipientEmail = order.getRecipientEmail();
        if (recipientEmail != null && !recipientEmail.isBlank()) {
            var recipientMail = EmailUtility.createOrderStatusUpdateEmail(
                    recipientEmail,
                    order.getOrderId(),
                    order.getStatus(),
                    order.getSenderFirstName(),
                    order.getRecipientFirstName(),
                    order.getAdminStatusNote(),
                    order.getAdminStatusPhoto()
            );
            emailService.sendEmail(recipientMail);
        }
    }
}
