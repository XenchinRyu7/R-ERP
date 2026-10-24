package com.fooderp.backend.production.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CompleteProductionOrderRequest(
    BigDecimal actualProducedQuantity,
    List<ConsumedItemRequest> consumedItems,
    String notes
) {
    public record ConsumedItemRequest(
        UUID ingredientProductId,
        BigDecimal actualQuantity
    ) {}
}
