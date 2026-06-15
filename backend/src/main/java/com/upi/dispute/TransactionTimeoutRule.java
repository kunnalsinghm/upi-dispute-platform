package com.upi.dispute;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class TransactionTimeoutRule implements DisputeRule {

    private static final int TIMEOUT_HOURS = 48;

    @Override
    public boolean applies(Dispute dispute) {
        return dispute.getDisputeType() == DisputeType.TRANSACTION_TIMEOUT;
    }

    @Override
    public DisputeResolutionResult resolve(Dispute dispute) {
        long hoursSinceCreation = ChronoUnit.HOURS.between(
                dispute.getCreatedAt(), LocalDateTime.now()
        );

        if (hoursSinceCreation >= TIMEOUT_HOURS) {
            return DisputeResolutionResult.builder()
                    .resolved(true)
                    .newStatus(DisputeStatus.AUTO_RESOLVED)
                    .resolutionReason("Transaction timeout confirmed after " + hoursSinceCreation + "h - refund initiated")
                    .confidenceScore(0.97)
                    .build();
        }

        return DisputeResolutionResult.builder()
                .resolved(false)
                .newStatus(DisputeStatus.OPEN)
                .resolutionReason("Timeout not yet reached - monitoring")
                .confidenceScore(0.60)
                .build();
    }
}