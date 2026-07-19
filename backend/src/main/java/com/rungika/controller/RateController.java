package com.rungika.controller;

import com.rungika.service.CurrencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/")
public class RateController {
    @Autowired CurrencyService currencyService;

    @GetMapping("/rate")
    public double getRate(@RequestParam String fromCurrency, @RequestParam String toCurrency){
        try {
            return currencyService.convert(fromCurrency, toCurrency);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to fetch exchange rate", e);
        }
    }
}
