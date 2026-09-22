package com.expensetracker.controller;

import com.expensetracker.dto.UserResponse;
import com.expensetracker.service.ProfileService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public UserResponse getProfile(@AuthenticationPrincipal Long userId) {
        return profileService.getProfile(userId);
    }
}
