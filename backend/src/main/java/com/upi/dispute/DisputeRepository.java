package com.upi.dispute;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, String> {
    List<Dispute> findByTransactionIdAndIdNot(String transactionId, String id);
    List<Dispute> findByStatus(DisputeStatus status);
    List<Dispute> findByBankCode(String bankCode);
}