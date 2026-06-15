package com.upi.dispute;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class DisputeProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public DisputeProducer(KafkaTemplate<String, String> kafkaTemplate,
                           ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishDisputeCreated(Dispute dispute) {
        try {
            String message = objectMapper.writeValueAsString(dispute);
            kafkaTemplate.send(KafkaConfig.DISPUTES_CREATED, dispute.getId(), message);
            System.out.println("Published to disputes.created: " + dispute.getId());
        } catch (Exception e) {
            System.err.println("Failed to publish dispute: " + e.getMessage());
        }
    }

    public void publishDisputeResolved(Dispute dispute) {
        try {
            String message = objectMapper.writeValueAsString(dispute);
            kafkaTemplate.send(KafkaConfig.DISPUTES_RESOLVED, dispute.getId(), message);
            System.out.println("Published to disputes.resolved: " + dispute.getId());
        } catch (Exception e) {
            System.err.println("Failed to publish resolved dispute: " + e.getMessage());
        }
    }
}