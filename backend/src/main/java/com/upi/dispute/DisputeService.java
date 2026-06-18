package com.upi.dispute;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeRuleEngine ruleEngine;
    private final DisputeProducer producer;
    private final MlClassifierClient mlClassifierClient;

    public DisputeService(DisputeRepository disputeRepository,
                          DisputeRuleEngine ruleEngine,
                          DisputeProducer producer,
                          MlClassifierClient mlClassifierClient) {
        this.disputeRepository = disputeRepository;
        this.ruleEngine = ruleEngine;
        this.producer = producer;
        this.mlClassifierClient = mlClassifierClient;
    }

    public Dispute createDispute(Dispute dispute) {
        // Call ML classifier first (if available)
        MlClassificationResult mlResult = mlClassifierClient.classify(dispute);
        if (mlResult.getConfidenceScore() > 0) {
            dispute.setMlConfidenceScore(mlResult.getConfidenceScore());
            System.out.println("ML classified as: " + mlResult.getPredictedType()
                    + " (" + mlResult.getConfidenceScore() + ")");
        }

        // Save to DB
        Dispute saved = disputeRepository.save(dispute);

        // Publish to Kafka async
        producer.publishDisputeCreated(saved);

        // Run rule engine synchronously for immediate response
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