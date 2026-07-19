package com.rungika.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping("/submit-details")
    public String submitPaymentDetails(@RequestBody CheckoutDetails checkoutDetails) throws StripeException {
        HashMap<String, Object> map = (HashMap<String, Object>) checkoutDetails.getTransferDetails();
        CheckoutPayment payment = new CheckoutPayment();
        payment.setAmount(Integer.toUnsignedLong((Integer) map.get("amount")) * 100);
        payment.setCurrency((String) map.get("fromCurrency"));
        payment.setCancelUrl(cancelUrl);
        payment.setSuccessUrl(successUrl);
        payment.setQuantity(1);
        payment.setName(map.get("amount") + (String) map.get("fromCurrency"));

        return handleRequest(payment);
    }

    @PostMapping("/submit")
    public String paymentWithCheckoutPage(@RequestBody CheckoutPayment payment) throws StripeException {
        return handleRequest(payment);
    }

    public String handleRequest(CheckoutPayment payment) throws StripeException {
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
        JSONObject jsonObject = new JSONObject();
        for (String key : responseData.keySet()) {
            jsonObject.put(key, responseData.get(key));
        }
        return jsonObject.toString();
    }

    private void init(String key) {
        Stripe.apiKey = key;
    }
}