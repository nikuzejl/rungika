package com.rungika.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.rungika.entity.Order;
import com.rungika.service.OrderService;
import com.rungika.service.OrderNumberService;
import com.rungika.service.EmailService;
import com.rungika.Utils.EmailUtility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/payment/")
public class StripeController {
    @Value("${stripe.secret.key}")
    String exchangeRateApiKey;

    @Value("${cancelUrl}")
    String cancelUrl;

    @Value("${successUrl}")
    String successUrl;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderNumberService orderNumberService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/submit-details")
    public Map<String, String> submitPaymentDetails(@RequestBody CheckoutDetails checkoutDetails) throws StripeException {
        HashMap<String, Object> map = (HashMap<String, Object>) checkoutDetails.getTransferDetails();
        CheckoutPayment payment = new CheckoutPayment();
        payment.setAmount(Integer.toUnsignedLong((Integer) map.get("amount")) * 100);
        payment.setCurrency((String) map.get("fromCurrency"));
        payment.setCancelUrl(cancelUrl);
        payment.setSuccessUrl(withSessionIdParam(successUrl));
        payment.setQuantity(1);
        payment.setName(map.get("amount") + (String) map.get("fromCurrency"));

        return handleRequest(payment);
    }

    @PostMapping("/submit")
    public Map<String, String> paymentWithCheckoutPage(@RequestBody CheckoutPayment payment) throws StripeException {
        return handleRequest(payment);
    }

    public Map<String, String> handleRequest(CheckoutPayment payment) throws StripeException {
        init(exchangeRateApiKey);
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT).setSuccessUrl(payment.getSuccessUrl())
                .setCancelUrl(
                        payment.getCancelUrl())
                .addLineItem(
                        SessionCreateParams.LineItem.builder().setQuantity(payment.getQuantity())
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(payment.getCurrency()).setUnitAmount(payment.getAmount())
                                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData
                                                        .builder().setName(payment.getName()).build())
                                                .build())
                                .build())
                .build();

        Session session = Session.create(params);
        Map<String, String> responseData = new HashMap<>();
        responseData.put("id", session.getId());
        responseData.put("url", session.getUrl());
        return responseData;
    }

    @GetMapping("/session-status")
    public Map<String, String> getSessionStatus(@RequestParam String sessionId) throws StripeException {
        init(exchangeRateApiKey);
        Session session = Session.retrieve(sessionId);
        Map<String, String> responseData = new HashMap<>();
        responseData.put("id", session.getId());
        responseData.put("status", session.getStatus());
        responseData.put("paymentStatus", session.getPaymentStatus());
        responseData.put("customerEmail", session.getCustomerDetails() != null ? session.getCustomerDetails().getEmail() : null);
        return responseData;
    }

    @PostMapping("/confirm-payment")
    public Map<String, Object> confirmPayment(@RequestBody PaymentConfirmation confirmation) throws StripeException {
        init(exchangeRateApiKey);
        Session session = Session.retrieve(confirmation.getSessionId());

        Map<String, Object> responseData = new HashMap<>();

        // Only process if payment is actually paid
        if (!"paid".equals(session.getPaymentStatus())) {
            responseData.put("success", false);
            responseData.put("message", "Payment not completed.");
            return responseData;
        }

        try {
            // Generate order number
            long orderId = orderNumberService.getNextOrderNumber("TRANSFER");

            // Create order
            Order order = new Order();
            order.setOrderId(orderId);
            order.setEmail(confirmation.getSenderEmail());
            order.setStatus("COMPLETED");
            order.setSessionId(confirmation.getSessionId());
            order.setTransactionTime(Instant.now());

            order.setSenderEmail(confirmation.getSenderEmail());
            order.setSenderFirstName(confirmation.getSenderFirstName());
            order.setSenderLastName(confirmation.getSenderLastName());
            order.setSenderPhone(confirmation.getSenderPhone());

            order.setRecipientEmail(confirmation.getRecipientEmail());
            order.setRecipientFirstName(confirmation.getRecipientFirstName());
            order.setRecipientLastName(confirmation.getRecipientLastName());
            order.setRecipientPhone(confirmation.getRecipientPhone());

            order.setAmount(confirmation.getAmount());
            order.setFromCurrency(confirmation.getFromCurrency());
            order.setConvertedAmount(confirmation.getConvertedAmount());
            order.setToCurrency(confirmation.getToCurrency());
            order.setReceiveMethod(confirmation.getReceiveMethod());
            orderService.createOrder(order);

            // Send confirmation emails
            var senderEmail = EmailUtility.createTransferConfirmationEmail(
                    confirmation.getSenderEmail(),
                    orderId,
                    confirmation.getSenderName(),
                    confirmation.getRecipientName(),
                    confirmation.getAmount(),
                    confirmation.getFromCurrency(),
                    confirmation.getConvertedAmount(),
                    confirmation.getToCurrency()
            );
            emailService.sendEmail(senderEmail);

            var recipientEmail = EmailUtility.createTransferNotificationEmail(
                    confirmation.getRecipientEmail(),
                    orderId,
                    confirmation.getSenderName(),
                    confirmation.getConvertedAmount(),
                    confirmation.getToCurrency()
            );
            emailService.sendEmail(recipientEmail);

            responseData.put("success", true);
            responseData.put("orderId", orderId);
            responseData.put("message", "Payment confirmed and emails sent.");
        } catch (Exception e) {
            responseData.put("success", false);
            responseData.put("message", "Error processing payment: " + e.getMessage());
            e.printStackTrace();
        }

        return responseData;
    }

    private String withSessionIdParam(String url) {
        if (url.contains("session_id={CHECKOUT_SESSION_ID}")) {
            return url;
        }
        String separator = url.contains("?") ? "&" : "?";
        return url + separator + "session_id={CHECKOUT_SESSION_ID}";
    }

    private void init(String key) {
        Stripe.apiKey = key;
    }
}