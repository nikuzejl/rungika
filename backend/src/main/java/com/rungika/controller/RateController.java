package com.rungika.controller;

import com.rungika.service.CurrencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rate")
public class RateController {
    @Autowired CurrencyService currencyService;

    @GetMapping("/latest")
    public double getRate(String fromCurrency, String toCurrency){
        return currencyService.convert(fromCurrency, toCurrency);
    }
}
