package com.fooderp.backend.production.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ProductionOrderDto(
    UUID id,
    String orderNumber,
    UUID recipeId,
    String recipeCode,
    String recipeName,
    UUID targetProductId,
    String targetProductCode,
    String targetProductName,
    UUID warehouseId,
    String warehouseCode,
    String warehouseName,
    BigDecimal plannedQuantity,
    BigDecimal actualQuantity,
    String status,
    LocalDateTime startDate,
    LocalDateTime completedDate,
    String notes,
    String createdBy,
    List<ProductionOrderItemDto> items,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
