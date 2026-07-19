package com.rungika.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class CurrencyService {
    private static final Logger LOGGER = LoggerFactory.getLogger(CurrencyService.class);

    @Value("${exchange.rate.cache.ttl.minutes}") int cacheTtlMinutes;
    @Value("${exchange.rate.api.key}") String exchangeRateApiKey;
    @Value("${exchange.rate.api.url}") String exchangeRateApiUrl;
    @Value("${exchange.rate.api.timeout}") int timeout;
    private final ConcurrentMap<String, CachedRates> ratesCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Object> sourceLocks = new ConcurrentHashMap<>();

    public double convert(String fromCurrency, String toCurrency){
        if (fromCurrency == null || toCurrency == null) {
            throw new IllegalArgumentException("Both fromCurrency and toCurrency are required");
        }

        String source = fromCurrency.trim().toUpperCase(Locale.ROOT);
        String target = toCurrency.trim().toUpperCase(Locale.ROOT);

        if (source.isEmpty() || target.isEmpty()) {
            throw new IllegalArgumentException("Both fromCurrency and toCurrency must be non-empty");
        }

        CachedRates cachedRates = ratesCache.get(source);
        if (isFresh(cachedRates)) {
            return getRate(cachedRates, target);
        }

        Object sourceLock = sourceLocks.computeIfAbsent(source, key -> new Object());
        synchronized (sourceLock) {
            cachedRates = ratesCache.get(source);
            if (isFresh(cachedRates)) {
                LOGGER.info("Using cached rates for source currency: {}", source);
                return getRate(cachedRates, target);
            }

            try {
                CachedRates refreshedRates = new CachedRates(fetchRatesFromApi(source), Instant.now());
                ratesCache.put(source, refreshedRates);
                LOGGER.info("Fetched and cached new rates for source currency: {}", source);
                return getRate(refreshedRates, target);
            } catch (IllegalStateException ex) {
                if (cachedRates != null) {
                    return getRate(cachedRates, target);
                }
                throw ex;
            }
        }
    }

    private boolean isFresh(CachedRates cachedRates) {
        return cachedRates != null && Duration.between(cachedRates.fetchedAt(), Instant.now()).compareTo(Duration.ofMinutes(cacheTtlMinutes)) < 0;
    }

    private double getRate(CachedRates cachedRates, String targetCurrency) {
        Double rate = cachedRates.rates().get(targetCurrency);
        if (rate == null) {
            throw new IllegalStateException("Currency " + targetCurrency + " is not available in API response");
        }
        return rate;
    }

    private Map<String, Double> fetchRatesFromApi(String sourceCurrency) {
        try {
            String apiUrl = exchangeRateApiUrl + sourceCurrency + "?apikey=" + exchangeRateApiKey;
            URL url = URI.create(apiUrl).toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(timeout);
            connection.setReadTimeout(timeout);

            int statusCode = connection.getResponseCode();
            if (statusCode < 200 || statusCode >= 300) {
                throw new IllegalStateException("Currency API returned HTTP " + statusCode);
            }

            StringBuilder response = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
            }

            JSONObject rates = new JSONObject(response.toString()).getJSONObject("rates");
            Map<String, Double> parsedRates = new HashMap<>();
            for (String currencyCode : rates.keySet()) {
                parsedRates.put(currencyCode.toUpperCase(Locale.ROOT), rates.getDouble(currencyCode));
            }
            return Collections.unmodifiableMap(parsedRates);
        } catch (IOException | RuntimeException e) {
            throw new IllegalStateException("Failed to fetch currency exchange rate", e);
        }
    }

    private record CachedRates(Map<String, Double> rates, Instant fetchedAt) {}
}
