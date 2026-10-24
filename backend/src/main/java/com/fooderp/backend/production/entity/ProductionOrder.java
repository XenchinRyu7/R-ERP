package com.fooderp.backend.production.entity;

import com.fooderp.backend.masterdata.entity.Warehouse;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "production_order")
public class ProductionOrder {

    @Id
    private UUID id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(name = "planned_quantity", nullable = false, precision = 15, scale = 2)
    private BigDecimal plannedQuantity;

    @Column(name = "actual_quantity", precision = 15, scale = 2)
    private BigDecimal actualQuantity = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String status = "PLANNED"; // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @OneToMany(mappedBy = "productionOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductionOrderItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ProductionOrder() {
    }

    public ProductionOrder(UUID id, String orderNumber, Recipe recipe, Warehouse warehouse,
                           BigDecimal plannedQuantity, String status, String notes, String createdBy) {
        this.id = id != null ? id : UUID.randomUUID();
        this.orderNumber = orderNumber;
        this.recipe = recipe;
        this.warehouse = warehouse;
        this.plannedQuantity = plannedQuantity;
        this.actualQuantity = BigDecimal.ZERO;
        this.status = status != null ? status : "PLANNED";
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (actualQuantity == null) actualQuantity = BigDecimal.ZERO;
        if (status == null) status = "PLANNED";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public BigDecimal getPlannedQuantity() {
        return plannedQuantity;
    }

    public void setPlannedQuantity(BigDecimal plannedQuantity) {
        this.plannedQuantity = plannedQuantity;
    }

    public BigDecimal getActualQuantity() {
        return actualQuantity;
    }

    public void setActualQuantity(BigDecimal actualQuantity) {
        this.actualQuantity = actualQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public List<ProductionOrderItem> getItems() {
        return items;
    }

    public void setItems(List<ProductionOrderItem> items) {
        this.items = items;
    }

    public void addItem(ProductionOrderItem item) {
        items.add(item);
        item.setProductionOrder(this);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
