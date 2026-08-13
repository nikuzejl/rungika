package com.rungika.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class EmailServiceTest {

    @Test
    void executeWithTimeout_shouldFailFastWhenActionDoesNotFinishInTime() throws Exception {
        EmailService service = new EmailService(
            mock(RestClient.class),
                true,
            "re_test_key",
                "noreply@resend.dev"
        );

        boolean result = service.executeWithTimeout(
                () -> {
                    Thread.sleep(500);
                    return true;
                },
                50,
                TimeUnit.MILLISECONDS,
                "to@example.com",
                "subject",
                "Resend"
        );

        assertThat(result).isFalse();
    }
}
