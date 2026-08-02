package com.rungika.repository;

import com.rungika.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    Order findByOrderId(long orderId);
    Order findTopByOrderByOrderIdDesc();
    boolean existsByOrderId(long orderId);

    List<Order> findByStatusOrderByOrderIdDesc(String status);
    List<Order> findByStatus(String status);

    List<Order> findByEmail(String email);
}
