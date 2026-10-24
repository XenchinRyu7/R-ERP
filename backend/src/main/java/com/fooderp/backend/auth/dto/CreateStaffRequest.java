package com.fooderp.backend.auth.dto;

import com.fooderp.backend.auth.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateStaffRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,

    @NotBlank(message = "Full name is required")
    String fullName,

    String phone,

    @NotNull(message = "Role is required")
    UserRole role,

    UUID warehouseId
) {
    public CreateStaffRequest(String username, String email, String password, String fullName, String phone, UserRole role) {
        this(username, email, password, fullName, phone, role, null);
    }
}
