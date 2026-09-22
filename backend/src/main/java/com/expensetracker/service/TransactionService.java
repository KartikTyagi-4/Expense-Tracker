package com.expensetracker.service;

import com.expensetracker.dto.PageResponse;
import com.expensetracker.dto.TransactionRequest;
import com.expensetracker.dto.TransactionResponse;
import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.TransactionType;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.TransactionSpecifications;
import com.expensetracker.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public PageResponse<TransactionResponse> search(Long userId, String search, TransactionType type,
                                                     String category, LocalDate startDate, LocalDate endDate,
                                                     String sort, int page, int size) {
        User user = getUser(userId);

        Specification<Transaction> spec = Specification
                .where(TransactionSpecifications.belongsTo(user))
                .and(TransactionSpecifications.descriptionContains(search))
                .and(TransactionSpecifications.hasType(type))
                .and(TransactionSpecifications.hasCategory(category))
                .and(TransactionSpecifications.dateFrom(startDate))
                .and(TransactionSpecifications.dateTo(endDate));

        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));

        return PageResponse.from(transactionRepository.findAll(spec, pageable).map(TransactionResponse::from));
    }

    @Transactional
    public TransactionResponse create(Long userId, TransactionRequest request) {
        User user = getUser(userId);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        applyRequest(transaction, request);

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    public TransactionResponse getOne(Long userId, Long transactionId) {
        return TransactionResponse.from(getOwnedTransaction(userId, transactionId));
    }

    @Transactional
    public TransactionResponse update(Long userId, Long transactionId, TransactionRequest request) {
        Transaction transaction = getOwnedTransaction(userId, transactionId);
        applyRequest(transaction, request);
        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long userId, Long transactionId) {
        Transaction transaction = getOwnedTransaction(userId, transactionId);
        transactionRepository.delete(transaction);
    }

    private Transaction getOwnedTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Transaction not found");
        }

        return transaction;
    }

    private void applyRequest(Transaction transaction, TransactionRequest request) {
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategory(request.category());
        transaction.setDescription(request.description());
        transaction.setDate(request.date());
        transaction.setPaymentMethod(request.paymentMethod());
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Sort resolveSort(String sort) {
        if (sort == null) {
            return Sort.by(Sort.Direction.DESC, "date");
        }
        return switch (sort) {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "date");
            case "highest" -> Sort.by(Sort.Direction.DESC, "amount");
            case "lowest" -> Sort.by(Sort.Direction.ASC, "amount");
            default -> Sort.by(Sort.Direction.DESC, "date");
        };
    }
}
