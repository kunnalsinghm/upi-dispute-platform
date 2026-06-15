package com.upi.dispute;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class WrongDebitRule implements DisputeRule {

    private static final BigDecimal MAX_AUTO_RESOLVE_AMOUNT = new BigDecimal("50000");

    @Override
    public boolean applies(Dispute dispute) {
        return dispute.getDisputeType() == DisputeType.WRONG_DEBIT;
    }

    @Override
    public DisputeResolutionResult resolve(Dispute dispute) {
        // Auto-resolve wrong debits under ₹50,000
        if (dispute.getAmount().compareTo(MAX_AUTO_RESOLVE_AMOUNT) <= 0) {
            return DisputeResolutionResult.builder()
                    .resolved(true)
                    .newStatus(DisputeStatus.AUTO_RESOLVED)
                    .resolutionReason("Wrong debit under ₹50,000 - auto-refund initiated")
                    .confidenceScore(0.94)
                    .build();
        }

        return DisputeResolutionResult.builder()
                .resolved(false)
                .newStatus(DisputeStatus.MANUAL_REVIEW)
                .resolutionReason("High value wrong debit - requires manual verification")
                .confidenceScore(0.72)
                .build();
    }
}