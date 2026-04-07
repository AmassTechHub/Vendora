package com.pos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pos.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class PaystackService {
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;
    private final String paystackSecretKey;

    public PaystackService(
            ObjectMapper objectMapper,
            @Value("${paystack.secret-key:}") String paystackSecretKey
    ) {
        this.objectMapper = objectMapper;
        this.paystackSecretKey = paystackSecretKey;
    }

    public VerifiedPayment verifyTransaction(String reference) {
        if (reference == null || reference.isBlank()) {
            throw new ApiException("Payment reference is required", HttpStatus.BAD_REQUEST);
        }
        if (paystackSecretKey == null || paystackSecretKey.isBlank()) {
            throw new ApiException("Paystack secret key is not configured", HttpStatus.BAD_REQUEST);
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.paystack.co/transaction/verify/" + reference))
                .header("Authorization", "Bearer " + paystackSecretKey)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new ApiException("Unable to verify transaction with Paystack", HttpStatus.BAD_REQUEST);
            }

            JsonNode payload = objectMapper.readTree(response.body());
            JsonNode data = payload.path("data");
            String status = data.path("status").asText();
            BigDecimal paidAmount = BigDecimal.valueOf(data.path("amount").asLong(0))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            return new VerifiedPayment(
                    "success".equalsIgnoreCase(status),
                    paidAmount,
                    data.path("channel").asText("unknown"),
                    data.path("reference").asText(reference),
                    payload.path("message").asText("Payment verification complete")
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException("Paystack verification failed: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            throw new ApiException("Paystack verification failed: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    public record VerifiedPayment(
            boolean success,
            BigDecimal amount,
            String channel,
            String reference,
            String message
    ) {}
}
