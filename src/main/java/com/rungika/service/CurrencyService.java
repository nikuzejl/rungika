package com.rungika.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class CurrencyService {
    @Value("${apiKey}") String apiKey;
    @Value("${currencyApiUrl}") String currencyApiUrl;

    public double convert(String fromCurrency, String toCurrency){
        try {
            String apiUrl = currencyApiUrl + fromCurrency + "?apikey=" + apiKey;
            HttpURLConnection connection = (HttpURLConnection) new URL(apiUrl).openConnection();
            connection.setRequestMethod("GET");

            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();

            JSONObject jsonResponse = new JSONObject(response.toString());
            return jsonResponse.getJSONObject("rates").getDouble(toCurrency);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }
}
