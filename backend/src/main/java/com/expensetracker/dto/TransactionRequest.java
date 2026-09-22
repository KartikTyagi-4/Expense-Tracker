package com.expensetracker.dto;

import com.expensetracker.entity.PaymentMethod;
import com.expensetracker.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        BigDecimal amount,

        @NotNull(message = "Type is required")
        TransactionType type,

        @NotBlank(message = "Category is required")
        String category,

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Date is required")
        @PastOrPresent(message = "Date cannot be in the future")
        LocalDate date,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod
) {
}
