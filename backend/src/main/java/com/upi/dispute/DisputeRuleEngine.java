package com.upi.dispute;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DisputeRuleEngine {

    private final List<DisputeRule> rules;
    private final DisputeRepository disputeRepository;

    public DisputeRuleEngine(List<DisputeRule> rules, DisputeRepository disputeRepository) {
        this.rules = rules;
        this.disputeRepository = disputeRepository;
    }

    public Dispute evaluate(Dispute dispute) {
        System.out.println("Evaluating dispute: " + dispute.getId() + " type: " + dispute.getDisputeType());

        for (DisputeRule rule : rules) {
            if (rule.applies(dispute)) {
                System.out.println("Applying rule: " + rule.getClass().getSimpleName());
                DisputeResolutionResult result = rule.resolve(dispute);
                dispute.setStatus(result.getNewStatus());
                dispute.setMlConfidenceScore(result.getConfidenceScore());
                dispute.setDescription(dispute.getDescription() + " | " + result.getResolutionReason());

                if (result.isResolved()) {
                    dispute.setResolvedAt(LocalDateTime.now());
                    System.out.println("Dispute " + dispute.getId() + " auto-resolved: " + result.getResolutionReason());
                } else {
                    System.out.println("Dispute " + dispute.getId() + " routed to: " + result.getNewStatus());
                }
                return disputeRepository.save(dispute);
            }
        }

        dispute.setStatus(DisputeStatus.MANUAL_REVIEW);
        System.out.println("No rule matched for dispute: " + dispute.getId());
        return disputeRepository.save(dispute);
    }
}