package com.rungika.service;

import com.rungika.entity.Order;
import com.rungika.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class OrderService {
    private static final Set<String> ADMIN_FINAL_STATUSES = Set.of("COMPLETED", "FAILED");

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Order createOrder(Order order) throws Exception {
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("PENDING");
        }

        boolean autoAssignOrderId = order.getOrderId() <= 0;
        int maxRetries = autoAssignOrderId ? 6 : 1;

        for (int attempt = 0; attempt < maxRetries; attempt++) {
            if (autoAssignOrderId) {
                order.setOrderId(getNextIncrementalOrderId());
            }

            try {
                return orderRepository.save(order);
            } catch (DuplicateKeyException e) {
                if (!autoAssignOrderId || attempt == maxRetries - 1) {
                    throw e;
                }
            }
        }

        throw new IllegalStateException("Failed to generate a unique incremental order number.");
    }

    private long getNextIncrementalOrderId() {
        Order latestOrder = orderRepository.findTopByOrderByOrderIdDesc();
        if (latestOrder == null) {
            return 1L;
        }

        return latestOrder.getOrderId() + 1;
    }

    public void updateOrderStatus(Long orderId, String newStatus) {
        Order orderToUpdate = orderRepository.findByOrderId(orderId);
        if (orderToUpdate != null) {
            orderToUpdate.setStatus(newStatus);
            orderRepository.save(orderToUpdate);
        }
    }

    public void deleteOrder(long orderId) {
        Order orderToDelete = orderRepository.findByOrderId(orderId);
        if (orderToDelete != null) {
            orderRepository.delete(orderToDelete);
        }
    }

    public Order getOrderByOrderId(long orderId) {
        return orderRepository.findByOrderId(orderId);
    }

    public List<Order> getPendingOrdersForAdmin() {
        return orderRepository.findByStatusOrderByOrderIdDesc("PENDING");
    }

    public Order updateOrderStatusByAdmin(long orderId, String requestedStatus, String adminEmail, String note, String photo) {
        Order order = orderRepository.findByOrderId(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found.");
        }

        String newStatus = requestedStatus == null ? "" : requestedStatus.trim().toUpperCase();
        if (!ADMIN_FINAL_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Status must be COMPLETED or FAILED.");
        }

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Only PENDING orders can be manually updated.");
        }

        order.setStatus(newStatus);
        order.setLastUpdatedByAdminEmail(adminEmail);
        order.setStatusUpdatedAt(Instant.now());

        if (note != null && !note.isBlank()) {
            order.setAdminStatusNote(note.trim());
        }
        if (photo != null && !photo.isBlank()) {
            order.setAdminStatusPhoto(photo.trim());
        }

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatusOrderByOrderIdDesc(status);
    }

    public List<Order> getOrdersByEmail(String email) {
        return orderRepository.findByEmail(email)
                .stream()
                .sorted(Comparator.comparingLong(Order::getOrderId).reversed())
                .toList();
    }
}
