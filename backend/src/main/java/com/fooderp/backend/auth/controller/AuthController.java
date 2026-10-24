package com.fooderp.backend.auth.controller;

import com.fooderp.backend.auth.dto.LoginRequest;
import com.fooderp.backend.auth.dto.LoginResponse;
import com.fooderp.backend.auth.dto.RegisterMitraRequest;
import com.fooderp.backend.auth.dto.UserDto;
import com.fooderp.backend.auth.entity.AppUser;
import com.fooderp.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register-mitra")
    public ResponseEntity<UserDto> registerMitra(@Valid @RequestBody RegisterMitraRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerMitra(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AppUser principal = (AppUser) authentication.getPrincipal();
        return ResponseEntity.ok(authService.getUserById(principal.getId()));
    }
}
