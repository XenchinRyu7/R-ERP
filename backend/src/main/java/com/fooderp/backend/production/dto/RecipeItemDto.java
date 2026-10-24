package com.fooderp.backend.production.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RecipeItemDto(
    UUID id,
    UUID ingredientProductId,
    String ingredientProductCode,
    String ingredientProductName,
    BigDecimal quantity,
    String unit,
    String notes
) {}
