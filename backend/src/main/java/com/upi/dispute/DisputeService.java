package com.upi.dispute;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeRuleEngine ruleEngine;

    public Dispute createDispute(Dispute dispute) {
        log.info("Creating dispute for transaction: {}", dispute.getTransactionId());
        // Save first to get an ID
        Dispute saved = disputeRepository.save(dispute);
        // Then run rule engine
        return ruleEngine.evaluate(saved);
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