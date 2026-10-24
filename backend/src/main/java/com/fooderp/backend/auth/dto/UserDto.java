package com.fooderp.backend.auth.dto;

import com.fooderp.backend.auth.entity.UserRole;
import com.fooderp.backend.auth.entity.UserStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserDto(
    UUID id,
    String username,
    String email,
    String fullName,
    UserRole role,
    String phone,
    UserStatus status,
    String partnerType,
    String partnerName,
    UUID customerId,
    String customerName,
    UUID supplierId,
    String supplierName,
    UUID warehouseId,
    String warehouseName,
    String warehouseCode,
    String approvalNotes,
    String approvedBy,
    LocalDateTime approvedAt,
    LocalDateTime createdAt
) {}
