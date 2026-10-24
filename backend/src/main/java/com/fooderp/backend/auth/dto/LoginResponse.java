package com.fooderp.backend.auth.dto;

public record LoginResponse(
    String token,
    String tokenType,
    UserDto user
) {
    public LoginResponse(String token, UserDto user) {
        this(token, "Bearer", user);
    }
}
