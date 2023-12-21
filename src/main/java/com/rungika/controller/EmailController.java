 package com.rungika.controller;

 import com.rungika.Utils.EmailUtility;
 import com.rungika.entity.Order;
 import com.rungika.service.EmailService;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.beans.factory.annotation.Value;
 import org.springframework.http.HttpStatus;
 import org.springframework.http.ResponseEntity;
 import org.springframework.web.bind.annotation.PostMapping;
 import org.springframework.web.bind.annotation.RequestBody;
 import org.springframework.web.bind.annotation.RestController;

 @RestController
 public class EmailController {
     @Autowired
     EmailService emailService;

     @Value("${orderTrackingBaseUrl}")
     String url;

     @PostMapping("/send-success-order-email")
     public ResponseEntity<String> sendSuccessOrderEmail(@RequestBody Order order) {
         var email = EmailUtility.createdOrderSentEmail(order.getEmail(), order.getOrderId(),
                 String.format("%s/%s", url, order.getOrderId()));
         emailService.sendEmail(email);
         return new ResponseEntity<>(HttpStatus.OK);
     }

     @PostMapping("/send-cancel-order-email")
     public ResponseEntity<String> sendCancelOrderEmail(@RequestBody Order order) {
         var email = EmailUtility.createdOrderCancelledEmail(order.getEmail(), order.getOrderId());
         emailService.sendEmail(email);
         return new ResponseEntity<>(HttpStatus.OK);
     }
 }
