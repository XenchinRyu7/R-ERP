package com.fooderp.backend.production.service;

import com.fooderp.backend.inventory.service.InventoryService;
import com.fooderp.backend.masterdata.entity.Product;
import com.fooderp.backend.masterdata.entity.Warehouse;
import com.fooderp.backend.masterdata.repository.ProductRepository;
import com.fooderp.backend.masterdata.repository.WarehouseRepository;
import com.fooderp.backend.production.dto.*;
import com.fooderp.backend.production.entity.ProductionOrder;
import com.fooderp.backend.production.entity.ProductionOrderItem;
import com.fooderp.backend.production.entity.Recipe;
import com.fooderp.backend.production.entity.RecipeItem;
import com.fooderp.backend.production.repository.ProductionOrderRepository;
import com.fooderp.backend.production.repository.RecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductionService {

    private final RecipeRepository recipeRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryService inventoryService;

    public ProductionService(
            RecipeRepository recipeRepository,
            ProductionOrderRepository productionOrderRepository,
            ProductRepository productRepository,
            WarehouseRepository warehouseRepository,
            InventoryService inventoryService) {
        this.recipeRepository = recipeRepository;
        this.productionOrderRepository = productionOrderRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryService = inventoryService;
    }

    // ================= RECIPE (BOM) MANAGEMENT =================

    public RecipeDto createRecipe(CreateRecipeRequest request) {
        Product targetProduct = productRepository.findById(request.targetProductId())
                .orElseThrow(() -> new RuntimeException("Target product not found with id: " + request.targetProductId()));

        String code = request.code();
        if (code == null || code.isBlank()) {
            code = "RCP-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        } else if (recipeRepository.findByCode(code).isPresent()) {
            throw new RuntimeException("Recipe with code " + code + " already exists");
        }

        BigDecimal yieldQty = request.yieldQuantity() != null && request.yieldQuantity().compareTo(BigDecimal.ZERO) > 0
                ? request.yieldQuantity()
                : BigDecimal.ONE;

        String unit = request.unit() != null && !request.unit().isBlank() ? request.unit() : targetProduct.getUnit();

        Recipe recipe = new Recipe(
                UUID.randomUUID(),
                code,
                request.name(),
                targetProduct,
                yieldQty,
                unit,
                request.description(),
                "ACTIVE"
        );

        if (request.items() != null) {
            for (CreateRecipeRequest.ItemRequest itemReq : request.items()) {
                Product ingredient = productRepository.findById(itemReq.ingredientProductId())
                        .orElseThrow(() -> new RuntimeException("Ingredient product not found with id: " + itemReq.ingredientProductId()));

                String itemUnit = itemReq.unit() != null && !itemReq.unit().isBlank() ? itemReq.unit() : ingredient.getUnit();
                RecipeItem recipeItem = new RecipeItem(
                        UUID.randomUUID(),
                        recipe,
                        ingredient,
                        itemReq.quantity(),
                        itemUnit,
                        itemReq.notes()
                );
                recipe.addItem(recipeItem);
            }
        }

        Recipe saved = recipeRepository.save(recipe);
        return toRecipeDto(saved);
    }

    @Transactional(readOnly = true)
    public List<RecipeDto> getAllRecipes() {
        return recipeRepository.findAll().stream()
                .map(this::toRecipeDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecipeDto getRecipeById(UUID id) {
        return recipeRepository.findById(id)
                .map(this::toRecipeDto)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));
    }

    // ================= PRODUCTION WORK ORDERS =================

    public ProductionOrderDto createProductionOrder(CreateProductionOrderRequest request) {
        Recipe recipe = recipeRepository.findById(request.recipeId())
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + request.recipeId()));

        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + request.warehouseId()));

        if (request.plannedQuantity() == null || request.plannedQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Planned quantity must be greater than zero");
        }

        String orderNumber = "WO-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));

        ProductionOrder order = new ProductionOrder(
                UUID.randomUUID(),
                orderNumber,
                recipe,
                warehouse,
                request.plannedQuantity(),
                "PLANNED",
                request.notes(),
                request.createdBy() != null ? request.createdBy() : "Kitchen Supervisor"
        );

        // Scale BOM ingredients to planned quantity: (plannedQuantity / yieldQuantity) * item.quantity
        BigDecimal scaleRatio = request.plannedQuantity().divide(recipe.getYieldQuantity(), 4, RoundingMode.HALF_UP);

        for (RecipeItem recipeItem : recipe.getItems()) {
            BigDecimal plannedIngredientQty = recipeItem.getQuantity().multiply(scaleRatio);
            ProductionOrderItem orderItem = new ProductionOrderItem(
                    UUID.randomUUID(),
                    order,
                    recipeItem.getIngredientProduct(),
                    plannedIngredientQty,
                    BigDecimal.ZERO,
                    recipeItem.getUnit()
            );
            order.addItem(orderItem);
        }

        ProductionOrder saved = productionOrderRepository.save(order);
        return toOrderDto(saved);
    }

    public ProductionOrderDto startProductionOrder(UUID id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Production order not found with id: " + id));

        if (!"PLANNED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Only PLANNED orders can be started. Current status: " + order.getStatus());
        }

        order.setStatus("IN_PROGRESS");
        order.setStartDate(LocalDateTime.now());
        return toOrderDto(productionOrderRepository.save(order));
    }

    public ProductionOrderDto completeProductionOrder(UUID id, CompleteProductionOrderRequest request) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Production order not found with id: " + id));

        if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Production order is already completed");
        }
        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Cannot complete a cancelled production order");
        }

        BigDecimal actualProduced = (request != null && request.actualProducedQuantity() != null && request.actualProducedQuantity().compareTo(BigDecimal.ZERO) > 0)
                ? request.actualProducedQuantity()
                : order.getPlannedQuantity();

        order.setActualQuantity(actualProduced);
        order.setStatus("COMPLETED");
        order.setCompletedDate(LocalDateTime.now());
        if (order.getStartDate() == null) {
            order.setStartDate(order.getCreatedAt());
        }
        if (request != null && request.notes() != null && !request.notes().isBlank()) {
            String existingNotes = order.getNotes() != null ? order.getNotes() + " | " : "";
            order.setNotes(existingNotes + request.notes());
        }

        // Map consumed items if explicitly passed in request
        Map<UUID, BigDecimal> consumedMap = null;
        if (request != null && request.consumedItems() != null && !request.consumedItems().isEmpty()) {
            consumedMap = request.consumedItems().stream()
                    .collect(Collectors.toMap(
                            CompleteProductionOrderRequest.ConsumedItemRequest::ingredientProductId,
                            CompleteProductionOrderRequest.ConsumedItemRequest::actualQuantity,
                            (q1, q2) -> q2
                    ));
        }

        // 1. Deduct raw materials consumed from warehouse stock (OUT_PRODUCTION)
        for (ProductionOrderItem item : order.getItems()) {
            BigDecimal actualConsumed = (consumedMap != null && consumedMap.containsKey(item.getIngredientProduct().getId()))
                    ? consumedMap.get(item.getIngredientProduct().getId())
                    : item.getPlannedQuantity();

            item.setActualConsumedQuantity(actualConsumed);

            inventoryService.recordStockMovement(
                    item.getIngredientProduct(),
                    order.getWarehouse(),
                    actualConsumed.negate(),
                    "OUT_PRODUCTION",
                    order.getOrderNumber(),
                    "Consumed in Production Work Order " + order.getOrderNumber()
            );
        }

        // 2. Add finished produced product to warehouse stock (IN_PRODUCTION)
        Product targetProduct = order.getRecipe().getTargetProduct();
        inventoryService.recordStockMovement(
                targetProduct,
                order.getWarehouse(),
                actualProduced,
                "IN_PRODUCTION",
                order.getOrderNumber(),
                "Produced from Work Order " + order.getOrderNumber() + " (" + order.getRecipe().getName() + ")"
        );

        ProductionOrder saved = productionOrderRepository.save(order);
        return toOrderDto(saved);
    }

    public ProductionOrderDto cancelProductionOrder(UUID id, String reason) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Production order not found with id: " + id));

        if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Cannot cancel an already completed production order");
        }

        order.setStatus("CANCELLED");
        String note = (order.getNotes() != null ? order.getNotes() + " | " : "") + "Cancelled: " + (reason != null ? reason : "User cancellation");
        order.setNotes(note);

        return toOrderDto(productionOrderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<ProductionOrderDto> getAllProductionOrders() {
        return productionOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toOrderDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductionOrderDto getProductionOrderById(UUID id) {
        return productionOrderRepository.findById(id)
                .map(this::toOrderDto)
                .orElseThrow(() -> new RuntimeException("Production order not found with id: " + id));
    }

    // ================= MAPPERS =================

    private RecipeDto toRecipeDto(Recipe recipe) {
        List<RecipeItemDto> items = recipe.getItems().stream().map(item -> new RecipeItemDto(
                item.getId(),
                item.getIngredientProduct().getId(),
                item.getIngredientProduct().getCode(),
                item.getIngredientProduct().getName(),
                item.getQuantity(),
                item.getUnit(),
                item.getNotes()
        )).collect(Collectors.toList());

        return new RecipeDto(
                recipe.getId(),
                recipe.getCode(),
                recipe.getName(),
                recipe.getTargetProduct().getId(),
                recipe.getTargetProduct().getCode(),
                recipe.getTargetProduct().getName(),
                recipe.getYieldQuantity(),
                recipe.getUnit(),
                recipe.getDescription(),
                recipe.getStatus(),
                items,
                recipe.getCreatedAt(),
                recipe.getUpdatedAt()
        );
    }

    private ProductionOrderDto toOrderDto(ProductionOrder order) {
        List<ProductionOrderItemDto> items = order.getItems().stream().map(item -> new ProductionOrderItemDto(
                item.getId(),
                item.getIngredientProduct().getId(),
                item.getIngredientProduct().getCode(),
                item.getIngredientProduct().getName(),
                item.getPlannedQuantity(),
                item.getActualConsumedQuantity(),
                item.getUnit()
        )).collect(Collectors.toList());

        return new ProductionOrderDto(
                order.getId(),
                order.getOrderNumber(),
                order.getRecipe().getId(),
                order.getRecipe().getCode(),
                order.getRecipe().getName(),
                order.getRecipe().getTargetProduct().getId(),
                order.getRecipe().getTargetProduct().getCode(),
                order.getRecipe().getTargetProduct().getName(),
                order.getWarehouse().getId(),
                order.getWarehouse().getCode(),
                order.getWarehouse().getName(),
                order.getPlannedQuantity(),
                order.getActualQuantity(),
                order.getStatus(),
                order.getStartDate(),
                order.getCompletedDate(),
                order.getNotes(),
                order.getCreatedBy(),
                items,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
