package com.fooderp.backend.production.entity;

import com.fooderp.backend.masterdata.entity.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "production_order_item")
public class ProductionOrderItem {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_order_id", nullable = false)
    private ProductionOrder productionOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ingredient_product_id", nullable = false)
    private Product ingredientProduct;

    @Column(name = "planned_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal plannedQuantity;

    @Column(name = "actual_consumed_quantity", precision = 15, scale = 4)
    private BigDecimal actualConsumedQuantity = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public ProductionOrderItem() {
    }

    public ProductionOrderItem(UUID id, ProductionOrder productionOrder, Product ingredientProduct,
                               BigDecimal plannedQuantity, BigDecimal actualConsumedQuantity, String unit) {
        this.id = id != null ? id : UUID.randomUUID();
        this.productionOrder = productionOrder;
        this.ingredientProduct = ingredientProduct;
        this.plannedQuantity = plannedQuantity;
        this.actualConsumedQuantity = actualConsumedQuantity != null ? actualConsumedQuantity : BigDecimal.ZERO;
        this.unit = unit;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (actualConsumedQuantity == null) actualConsumedQuantity = BigDecimal.ZERO;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ProductionOrder getProductionOrder() {
        return productionOrder;
    }

    public void setProductionOrder(ProductionOrder productionOrder) {
        this.productionOrder = productionOrder;
    }

    public Product getIngredientProduct() {
        return ingredientProduct;
    }

    public void setIngredientProduct(Product ingredientProduct) {
        this.ingredientProduct = ingredientProduct;
    }

    public BigDecimal getPlannedQuantity() {
        return plannedQuantity;
    }

    public void setPlannedQuantity(BigDecimal plannedQuantity) {
        this.plannedQuantity = plannedQuantity;
    }

    public BigDecimal getActualConsumedQuantity() {
        return actualConsumedQuantity;
    }

    public void setActualConsumedQuantity(BigDecimal actualConsumedQuantity) {
        this.actualConsumedQuantity = actualConsumedQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
