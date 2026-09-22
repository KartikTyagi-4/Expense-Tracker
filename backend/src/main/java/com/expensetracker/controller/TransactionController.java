package com.expensetracker.controller;

import com.expensetracker.dto.PageResponse;
import com.expensetracker.dto.TransactionRequest;
import com.expensetracker.dto.TransactionResponse;
import com.expensetracker.entity.TransactionType;
import com.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public PageResponse<TransactionResponse> getAll(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return transactionService.search(userId, search, type, category, startDate, endDate, sort, page, size);
    }

    @GetMapping("/{id}")
    public TransactionResponse getOne(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return transactionService.getOne(userId, id);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@AuthenticationPrincipal Long userId,
                                                       @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(userId, request));
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@AuthenticationPrincipal Long userId, @PathVariable Long id,
                                      @Valid @RequestBody TransactionRequest request) {
        return transactionService.update(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        transactionService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
