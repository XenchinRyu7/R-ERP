package com.fooderp.backend.production.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductionOrderItemDto(
    UUID id,
    UUID ingredientProductId,
    String ingredientProductCode,
    String ingredientProductName,
    BigDecimal plannedQuantity,
    BigDecimal actualConsumedQuantity,
    String unit
) {}
