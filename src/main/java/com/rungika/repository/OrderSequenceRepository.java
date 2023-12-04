package com.rungika.repository;

import com.rungika.entity.OrderSequence;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderSequenceRepository extends MongoRepository<OrderSequence, String> {
    OrderSequence findByOrderType(String orderType);
}
