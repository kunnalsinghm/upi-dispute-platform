package com.upi.dispute;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class DisputeConsumer {

    private final DisputeRuleEngine ruleEngine;
    private final DisputeProducer producer;
    private final ObjectMapper objectMapper;

    public DisputeConsumer(DisputeRuleEngine ruleEngine,
                           DisputeProducer producer,
                           ObjectMapper objectMapper) {
        this.ruleEngine = ruleEngine;
        this.producer = producer;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaConfig.DISPUTES_CREATED,
                   groupId = "dispute-processor")
    public void processDispute(String message) {
        try {
            System.out.println("Received from Kafka: " + message.substring(0, 50) + "...");
            Dispute dispute = objectMapper.readValue(message, Dispute.class);
            Dispute resolved = ruleEngine.evaluate(dispute);
            producer.publishDisputeResolved(resolved);
            System.out.println("Processed dispute: " + resolved.getId() + " → " + resolved.getStatus());
        } catch (Exception e) {
            System.err.println("Error processing dispute from Kafka: " + e.getMessage());
        }
    }
}