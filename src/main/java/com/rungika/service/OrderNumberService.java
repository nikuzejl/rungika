package com.rungika.service;

import com.rungika.entity.OrderSequence;
import com.rungika.repository.OrderSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderNumberService {
    @Autowired
    private OrderSequenceRepository orderSequenceRepository;

    public synchronized long getNextOrderNumber(String orderType) {
        OrderSequence sequence = orderSequenceRepository.findByOrderType(orderType);

        if (sequence == null) {
            sequence = new OrderSequence();
            sequence.setOrderType(orderType);
            sequence.setSequenceValue(1);
            orderSequenceRepository.save(sequence);
        } else {
            long newSequenceValue = sequence.getSequenceValue() + 1;
            sequence.setSequenceValue(newSequenceValue);
            orderSequenceRepository.save(sequence);
        }

        return sequence.getSequenceValue();
    }
}
