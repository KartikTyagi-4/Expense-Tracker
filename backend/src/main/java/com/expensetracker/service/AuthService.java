package com.expensetracker.service;

import com.expensetracker.dto.AuthResponse;
import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.dto.UserResponse;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.DuplicateResourceException;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));

        return UserResponse.from(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId());
        return new AuthResponse(token, UserResponse.from(user));
    }
}
