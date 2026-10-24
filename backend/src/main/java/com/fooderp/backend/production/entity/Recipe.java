package com.fooderp.backend.production.entity;

import com.fooderp.backend.masterdata.entity.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "recipe")
public class Recipe {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_product_id", nullable = false)
    private Product targetProduct;

    @Column(name = "yield_quantity", nullable = false, precision = 15, scale = 2)
    private BigDecimal yieldQuantity = BigDecimal.ONE;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RecipeItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Recipe() {
    }

    public Recipe(UUID id, String code, String name, Product targetProduct, BigDecimal yieldQuantity,
                  String unit, String description, String status) {
        this.id = id != null ? id : UUID.randomUUID();
        this.code = code;
        this.name = name;
        this.targetProduct = targetProduct;
        this.yieldQuantity = yieldQuantity != null ? yieldQuantity : BigDecimal.ONE;
        this.unit = unit;
        this.description = description;
        this.status = status != null ? status : "ACTIVE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (yieldQuantity == null) yieldQuantity = BigDecimal.ONE;
        if (status == null) status = "ACTIVE";
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Product getTargetProduct() {
        return targetProduct;
    }

    public void setTargetProduct(Product targetProduct) {
        this.targetProduct = targetProduct;
    }

    public BigDecimal getYieldQuantity() {
        return yieldQuantity;
    }

    public void setYieldQuantity(BigDecimal yieldQuantity) {
        this.yieldQuantity = yieldQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<RecipeItem> getItems() {
        return items;
    }

    public void setItems(List<RecipeItem> items) {
        this.items = items;
    }

    public void addItem(RecipeItem item) {
        items.add(item);
        item.setRecipe(this);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
