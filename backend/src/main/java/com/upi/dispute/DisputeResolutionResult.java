package com.upi.dispute;

public class DisputeResolutionResult {

    private boolean resolved;
    private DisputeStatus newStatus;
    private String resolutionReason;
    private double confidenceScore;

    public DisputeResolutionResult() {}

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }

    public DisputeStatus getNewStatus() { return newStatus; }
    public void setNewStatus(DisputeStatus newStatus) { this.newStatus = newStatus; }

    public String getResolutionReason() { return resolutionReason; }
    public void setResolutionReason(String resolutionReason) { this.resolutionReason = resolutionReason; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DisputeResolutionResult result = new DisputeResolutionResult();
        public Builder resolved(boolean v) { result.resolved = v; return this; }
        public Builder newStatus(DisputeStatus v) { result.newStatus = v; return this; }
        public Builder resolutionReason(String v) { result.resolutionReason = v; return this; }
        public Builder confidenceScore(double v) { result.confidenceScore = v; return this; }
        public DisputeResolutionResult build() { return result; }
    }
}