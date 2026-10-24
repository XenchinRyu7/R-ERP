package com.fooderp.backend.production.entity;

import com.fooderp.backend.masterdata.entity.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "recipe_item")
public class RecipeItem {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ingredient_product_id", nullable = false)
    private Product ingredientProduct;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public RecipeItem() {
    }

    public RecipeItem(UUID id, Recipe recipe, Product ingredientProduct, BigDecimal quantity, String unit, String notes) {
        this.id = id != null ? id : UUID.randomUUID();
        this.recipe = recipe;
        this.ingredientProduct = ingredientProduct;
        this.quantity = quantity;
        this.unit = unit;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public Product getIngredientProduct() {
        return ingredientProduct;
    }

    public void setIngredientProduct(Product ingredientProduct) {
        this.ingredientProduct = ingredientProduct;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
