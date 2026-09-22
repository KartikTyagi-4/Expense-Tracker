package com.expensetracker.dto;

import com.expensetracker.entity.PaymentMethod;
import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        TransactionType type,
        String category,
        String description,
        LocalDate date,
        PaymentMethod paymentMethod
) {

    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getCategory(),
                transaction.getDescription(),
                transaction.getDate(),
                transaction.getPaymentMethod()
        );
    }
}
