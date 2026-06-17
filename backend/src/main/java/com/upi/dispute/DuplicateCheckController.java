package com.upi.dispute;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/rules")
public class DuplicateCheckController {

    @Autowired
    private DisputeRepository disputeRepository;

    @Autowired
    private DuplicateTransactionRule duplicateRule;

    @PostMapping("/duplicate/check")
    public Map<String, Object> checkDuplicate(@RequestBody Map<String, Object> request) {
        String transactionId = (String) request.get("transactionId");
        Double amount = (Double) request.get("amount");
        String customerId = (String) request.get("customerId");

        // Check if duplicate exists
        boolean isDuplicate = duplicateRule.isDuplicate(transactionId, amount, customerId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("transactionId", transactionId);
        response.put("isDuplicate", isDuplicate);
        response.put("message", isDuplicate ? "DUPLICATE TRANSACTION DETECTED" : "No duplicate found");
        
        if (isDuplicate) {
            response.put("action", "AUTO_REJECTED");
            response.put("rule", "DUPLICATE_TRANSACTION_RULE");
        }
        
        return response;
    }
}