package com.rungika.service;

import com.rungika.entity.Order;
import com.rungika.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Order createOrder(Order order) throws Exception {
        return orderRepository.save(order);
    }

    public void updateOrderStatus(Long orderId, String newStatus) {
        Order orderToUpdate = orderRepository.findByOrderId(orderId);
        if (orderToUpdate != null) {
            orderToUpdate.setStatus(newStatus);
            orderRepository.save(orderToUpdate);
        }
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> getOrdersByEmail(String email) {
        return orderRepository.findByEmail(email)
                .stream()
                .sorted(Comparator.comparingLong(Order::getOrderId).reversed())
                .toList();
    }
}
