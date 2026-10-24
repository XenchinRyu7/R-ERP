package com.fooderp.backend.production.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateProductionOrderRequest(
    UUID recipeId,
    UUID warehouseId,
    BigDecimal plannedQuantity,
    String notes,
    String createdBy
) {}
