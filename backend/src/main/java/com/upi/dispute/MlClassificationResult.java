package com.upi.dispute;

public class MlClassificationResult {
    private final String predictedType;
    private final double confidenceScore;

    public MlClassificationResult(String predictedType, double confidenceScore) {
        this.predictedType = predictedType;
        this.confidenceScore = confidenceScore;
    }

    public String getPredictedType() { return predictedType; }
    public double getConfidenceScore() { return confidenceScore; }
}