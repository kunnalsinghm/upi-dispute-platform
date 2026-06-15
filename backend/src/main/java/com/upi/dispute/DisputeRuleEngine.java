package com.upi.dispute;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisputeRuleEngine {

    private final List<DisputeRule> rules;
    private final DisputeRepository disputeRepository;

    public Dispute evaluate(Dispute dispute) {
        log.info("Evaluating dispute: {} type: {}", dispute.getId(), dispute.getDisputeType());

        for (DisputeRule rule : rules) {
            if (rule.applies(dispute)) {
                log.info("Applying rule: {}", rule.getClass().getSimpleName());

                DisputeResolutionResult result = rule.resolve(dispute);
                dispute.setStatus(result.getNewStatus());
                dispute.setMlConfidenceScore(result.getConfidenceScore());
                dispute.setDescription(dispute.getDescription() + " | " + result.getResolutionReason());

                if (result.isResolved()) {
                    dispute.setResolvedAt(LocalDateTime.now());
                    log.info("Dispute {} auto-resolved: {}", dispute.getId(), result.getResolutionReason());
                } else {
                    log.info("Dispute {} sent to: {} - {}", dispute.getId(), result.getNewStatus(), result.getResolutionReason());
                }

                return disputeRepository.save(dispute);
            }
        }

        // No rule matched — send to manual review
        dispute.setStatus(DisputeStatus.MANUAL_REVIEW);
        log.warn("No rule matched for dispute: {} - routing to manual review", dispute.getId());
        return disputeRepository.save(dispute);
    }
}