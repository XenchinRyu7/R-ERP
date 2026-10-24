package com.fooderp.backend.auth.controller;

import com.fooderp.backend.auth.dto.ApproveMitraRequest;
import com.fooderp.backend.auth.dto.CreateStaffRequest;
import com.fooderp.backend.auth.dto.UserDto;
import com.fooderp.backend.auth.entity.AppUser;
import com.fooderp.backend.auth.entity.UserStatus;
import com.fooderp.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PostMapping("/staff")
    public ResponseEntity<UserDto> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createStaff(request));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<UserDto> approveMitra(
            @PathVariable UUID id,
            @RequestBody ApproveMitraRequest request,
            Authentication authentication) {
        String approver = (authentication != null && authentication.getPrincipal() instanceof AppUser)
                ? ((AppUser) authentication.getPrincipal()).getUsername()
                : "Superadmin";
        return ResponseEntity.ok(authService.approveMitra(id, request, approver));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserDto> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        UserStatus status = UserStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(authService.updateUserStatus(id, status));
    }
}
