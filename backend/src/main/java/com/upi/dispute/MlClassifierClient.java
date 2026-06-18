package com.upi.dispute;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class MlClassifierClient {

    private final RestTemplate restTemplate;
    private static final String ML_URL = "http://localhost:5000/classify";

    public MlClassifierClient() {
        this.restTemplate = new RestTemplate();
    }

    public MlClassificationResult classify(Dispute dispute) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("amount", dispute.getAmount());
            payload.put("hourOfDay", LocalTime.now().getHour());
            payload.put("ageHours", 0);
            payload.put("hasDuplicate", 0);
            payload.put("bankCode", dispute.getBankCode());
            payload.put("upiHandle", "@gpay");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(ML_URL, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();
                return new MlClassificationResult(
                    (String) body.get("disputeType"),
                    ((Number) body.get("confidenceScore")).doubleValue()
                );
            }
        } catch (Exception e) {
            System.out.println("ML service unavailable, skipping: " + e.getMessage());
        }
        return new MlClassificationResult(null, 0.0);
    }
}