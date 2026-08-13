package com.rungika.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MailConfiguration {

    @Bean
    public RestClient resendRestClient(RestClient.Builder builder) {
        return builder.baseUrl("https://api.resend.com").build();
    }
}
