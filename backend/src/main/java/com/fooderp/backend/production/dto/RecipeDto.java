package com.fooderp.backend.production.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RecipeDto(
    UUID id,
    String code,
    String name,
    UUID targetProductId,
    String targetProductCode,
    String targetProductName,
    BigDecimal yieldQuantity,
    String unit,
    String description,
    String status,
    List<RecipeItemDto> items,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
