package com.upi.dispute;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    public ResponseEntity<Dispute> createDispute(@RequestBody Dispute dispute) {
        Dispute created = disputeService.createDispute(dispute);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Dispute>> getAllDisputes() {
        return ResponseEntity.ok(disputeService.getAllDisputes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dispute> getDispute(@PathVariable String id) {
        return ResponseEntity.ok(disputeService.getDisputeById(id));
    }
}