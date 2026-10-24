package com.fooderp.backend.production.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateRecipeRequest(
    String code,
    String name,
    UUID targetProductId,
    BigDecimal yieldQuantity,
    String unit,
    String description,
    List<ItemRequest> items
) {
    public record ItemRequest(
        UUID ingredientProductId,
        BigDecimal quantity,
        String unit,
        String notes
    ) {}
}
