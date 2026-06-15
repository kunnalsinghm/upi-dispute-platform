package com.upi.dispute;

public interface DisputeRule {
    boolean applies(Dispute dispute);
    DisputeResolutionResult resolve(Dispute dispute);
}