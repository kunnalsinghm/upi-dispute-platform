package com.upi.dispute;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DuplicateTransactionRule implements DisputeRule {

    private final DisputeRepository disputeRepository;

    @Override
    public boolean applies(Dispute dispute) {
        return dispute.getDisputeType() == DisputeType.DUPLICATE_TRANSACTION;
    }

    @Override
    public DisputeResolutionResult resolve(Dispute dispute) {
        // Find other disputes with same transaction ID
        List<Dispute> existing = disputeRepository
                .findByTransactionIdAndIdNot(dispute.getTransactionId(), dispute.getId());

        if (!existing.isEmpty()) {
            return DisputeResolutionResult.builder()
                    .resolved(true)
                    .newStatus(DisputeStatus.AUTO_RESOLVED)
                    .resolutionReason("Duplicate transaction detected - refund initiated")
                    .confidenceScore(0.99)
                    .build();
        }

        return DisputeResolutionResult.builder()
                .resolved(false)
                .newStatus(DisputeStatus.MANUAL_REVIEW)
                .resolutionReason("No duplicate found - needs manual review")
                .confidenceScore(0.45)
                .build();
    }
}