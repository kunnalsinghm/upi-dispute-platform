package com.upi.dispute;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")
public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String transactionId;

    @Column(nullable = false)
    private String raisedByUpiId;

    @Column(nullable = false)
    private String beneficiaryUpiId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisputeType disputeType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisputeStatus status;

    @Column(nullable = false)
    private String bankCode;

    private String description;

    private Double mlConfidenceScore;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = DisputeStatus.OPEN;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getRaisedByUpiId() { return raisedByUpiId; }
    public void setRaisedByUpiId(String raisedByUpiId) { this.raisedByUpiId = raisedByUpiId; }

    public String getBeneficiaryUpiId() { return beneficiaryUpiId; }
    public void setBeneficiaryUpiId(String beneficiaryUpiId) { this.beneficiaryUpiId = beneficiaryUpiId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public DisputeType getDisputeType() { return disputeType; }
    public void setDisputeType(DisputeType disputeType) { this.disputeType = disputeType; }

    public DisputeStatus getStatus() { return status; }
    public void setStatus(DisputeStatus status) { this.status = status; }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getMlConfidenceScore() { return mlConfidenceScore; }
    public void setMlConfidenceScore(Double mlConfidenceScore) { this.mlConfidenceScore = mlConfidenceScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}