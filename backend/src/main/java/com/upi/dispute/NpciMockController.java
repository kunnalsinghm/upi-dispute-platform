package com.upi.dispute;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/npci/api/v1")
public class NpciMockController {

    private final Map<String, Map<String, Object>> disputes = new ConcurrentHashMap<>();

    @PostMapping("/disputes/raise")
    public ResponseEntity<Map<String, Object>> raiseDispute(@RequestBody Map<String, String> request) {
        String arn = "ARN" + System.currentTimeMillis() + String.format("%04d", new Random().nextInt(9999));
        Map<String, Object> ack = new HashMap<>();
        ack.put("arn", arn);
        ack.put("disputeId", request.get("disputeId"));
        ack.put("transactionId", request.get("transactionId"));
        ack.put("status", "ACKNOWLEDGED");
        ack.put("message", "Dispute registered with NPCI. ARN: " + arn);
        ack.put("acknowledgedAt", LocalDateTime.now().toString());
        ack.put("resolutionDeadline", LocalDateTime.now().plusDays(5)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        disputes.put(arn, ack);
        System.out.println("NPCI Mock: Dispute raised - ARN: " + arn);
        return ResponseEntity.ok(ack);
    }

    @GetMapping("/disputes/{arn}/status")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable String arn) {
        Map<String, Object> ack = disputes.get(arn);
        if (ack == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ack);
    }

    @GetMapping("/disputes")
    public ResponseEntity<List<Map<String, Object>>> getAllDisputes() {
        return ResponseEntity.ok(new ArrayList<>(disputes.values()));
    }

    @PostMapping("/disputes/{arn}/escalate")
    public ResponseEntity<Map<String, Object>> escalate(@PathVariable String arn,
                                                         @RequestBody Map<String, String> request) {
        Map<String, Object> ack = disputes.get(arn);
        if (ack == null) return ResponseEntity.notFound().build();
        ack.put("status", "ESCALATED");
        ack.put("escalationId", "ESC" + System.currentTimeMillis());
        ack.put("message", "Escalated to NPCI Level 2. Reason: " + request.getOrDefault("reason", "SLA breach"));
        return ResponseEntity.ok(ack);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "NPCI Dispute Portal Mock",
            "version", "v2.1",
            "activeDisputes", String.valueOf(disputes.size())
        ));
    }
}
