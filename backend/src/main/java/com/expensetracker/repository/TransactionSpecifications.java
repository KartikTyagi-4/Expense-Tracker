package com.expensetracker.repository;

import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.TransactionType;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    public static Specification<Transaction> belongsTo(User user) {
        return (root, query, cb) -> cb.equal(root.get("user"), user);
    }

    public static Specification<Transaction> hasType(TransactionType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Transaction> hasCategory(String category) {
        return (root, query, cb) ->
                (category == null || category.isBlank()) ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Transaction> descriptionContains(String search) {
        return (root, query, cb) -> (search == null || search.isBlank())
                ? null
                : cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%");
    }

    public static Specification<Transaction> dateFrom(LocalDate startDate) {
        return (root, query, cb) ->
                startDate == null ? null : cb.greaterThanOrEqualTo(root.get("date"), startDate);
    }

    public static Specification<Transaction> dateTo(LocalDate endDate) {
        return (root, query, cb) ->
                endDate == null ? null : cb.lessThanOrEqualTo(root.get("date"), endDate);
    }
}
