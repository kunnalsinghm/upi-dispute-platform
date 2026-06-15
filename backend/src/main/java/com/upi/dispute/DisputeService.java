package com.upi.dispute;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeRuleEngine ruleEngine;
    private final DisputeProducer producer;

    public DisputeService(DisputeRepository disputeRepository,
                          DisputeRuleEngine ruleEngine,
                          DisputeProducer producer) {
        this.disputeRepository = disputeRepository;
        this.ruleEngine = ruleEngine;
        this.producer = producer;
    }

    public Dispute createDispute(Dispute dispute) {
        // Save immediately
        Dispute saved = disputeRepository.save(dispute);

        // Publish to Kafka (async processing)
        producer.publishDisputeCreated(saved);

        // Also run rule engine synchronously for immediate response
        Dispute resolved = ruleEngine.evaluate(saved);
        producer.publishDisputeResolved(resolved);

        return resolved;
    }

    public List<Dispute> getAllDisputes() {
        return disputeRepository.findAll();
    }

    public Dispute getDisputeById(String id) {
        return disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + id));
    }

    public List<Dispute> getDisputesByStatus(DisputeStatus status) {
        return disputeRepository.findByStatus(status);
    }
}