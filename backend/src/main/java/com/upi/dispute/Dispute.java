package com.upi.dispute;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // The original UPI transaction reference
    @Column(nullable = false, unique = true)
    private String transactionId;

    // Who raised the dispute
    @Column(nullable = false)
    private String raisedByUpiId;

    // Who received the money
    @Column(nullable = false)
    private String beneficiaryUpiId;

    // Amount in dispute
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // Category of dispute
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisputeType disputeType;

    // Current status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisputeStatus status;

    // Which bank/PSP is involved
    @Column(nullable = false)
    private String bankCode;

    // Description from the user
    private String description;

    // ML classifier confidence score (0.0 to 1.0)
    private Double mlConfidenceScore;

    // Timestamps
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
}