package com.expensetracker.service;

import com.expensetracker.dto.UserResponse;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getProfile(Long userId) {
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
