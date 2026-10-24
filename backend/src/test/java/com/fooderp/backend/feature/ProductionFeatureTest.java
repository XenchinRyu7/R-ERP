package com.fooderp.backend.feature;

import com.fooderp.backend.inventory.repository.InventoryStockRepository;
import com.fooderp.backend.inventory.service.InventoryService;
import com.fooderp.backend.masterdata.entity.Product;
import com.fooderp.backend.masterdata.entity.ProductCategory;
import com.fooderp.backend.masterdata.entity.Warehouse;
import com.fooderp.backend.masterdata.repository.ProductCategoryRepository;
import com.fooderp.backend.masterdata.repository.ProductRepository;
import com.fooderp.backend.masterdata.repository.WarehouseRepository;
import com.fooderp.backend.production.dto.CompleteProductionOrderRequest;
import com.fooderp.backend.production.dto.CreateProductionOrderRequest;
import com.fooderp.backend.production.dto.CreateRecipeRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Feature: Central Kitchen Recipe BOM and Production Lifecycle")
public class ProductionFeatureTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private InventoryStockRepository stockRepository;

    @Autowired
    private InventoryService inventoryService;

    private Product targetProduct;
    private Product rawIngredient1;
    private Product rawIngredient2;
    private Warehouse kitchenWarehouse;

    @BeforeEach
    void setUp() {
        ProductCategory foodCategory = categoryRepository.findAll().stream().findFirst()
                .orElseGet(() -> categoryRepository.save(new ProductCategory(UUID.randomUUID(), "RAW", "Raw Materials", "Ingredients", "ACTIVE")));

        // Finished Good Product
        targetProduct = productRepository.findByCode("FG-RENDANG-01").orElseGet(() ->
                productRepository.save(new Product(
                        UUID.randomUUID(),
                        "FG-RENDANG-01",
                        "Signature Cooked Rendang Base",
                        foodCategory,
                        "kg",
                        new BigDecimal("95000.00"),
                        new BigDecimal("150000.00"),
                        5,
                        "Ready to serve Rendang base",
                        "ACTIVE"
                ))
        );

        // Raw Ingredient 1: Beef
        rawIngredient1 = productRepository.findByCode("RAW-BEEF-01").orElseGet(() ->
                productRepository.save(new Product(
                        UUID.randomUUID(),
                        "RAW-BEEF-01",
                        "Fresh Beef Shank",
                        foodCategory,
                        "kg",
                        new BigDecimal("120000.00"),
                        new BigDecimal("140000.00"),
                        10,
                        "Prime cut beef shank",
                        "ACTIVE"
                ))
        );

        // Raw Ingredient 2: Spice Paste
        rawIngredient2 = productRepository.findByCode("RAW-SPICE-01").orElseGet(() ->
                productRepository.save(new Product(
                        UUID.randomUUID(),
                        "RAW-SPICE-01",
                        "Padang Curry Spice Paste",
                        foodCategory,
                        "kg",
                        new BigDecimal("40000.00"),
                        new BigDecimal("60000.00"),
                        5,
                        "Traditional padang spice blend",
                        "ACTIVE"
                ))
        );

        // Central Kitchen Warehouse
        kitchenWarehouse = warehouseRepository.findByCode("WH-KITCHEN-03").orElseGet(() ->
                warehouseRepository.save(new Warehouse(
                        UUID.randomUUID(),
                        "WH-KITCHEN-03",
                        "Central Commissary Kitchen SCBD",
                        "SCBD Lot 8, Jakarta",
                        "ACTIVE"
                ))
        );

        // Ensure stock of raw materials exists in kitchen warehouse
        inventoryService.recordStockMovement(rawIngredient1, kitchenWarehouse, new BigDecimal("100.00"), "IN_PURCHASE", "INIT-RAW-1", "Initial stock for test");
        inventoryService.recordStockMovement(rawIngredient2, kitchenWarehouse, new BigDecimal("50.00"), "IN_PURCHASE", "INIT-RAW-2", "Initial stock for test");
    }

    @Nested
    @DisplayName("Given a recipe with bill of materials (BOM)")
    class RecipeAndProductionWorkOrderLifecycle {

        @Test
        @DisplayName("Scenario: Define recipe, issue work order, start production, and complete with automated inventory movements")
        void testEndToEndProductionLifecycle() throws Exception {
            // 1. Create Recipe (BOM)
            // Recipe: 10 kg of Finished Rendang requires 12 kg beef and 3 kg spice paste
            CreateRecipeRequest recipeRequest = new CreateRecipeRequest(
                    "RCP-RENDANG-10KG-" + UUID.randomUUID().toString().substring(0, 8),
                    "Signature Rendang 10kg Batch",
                    targetProduct.getId(),
                    new BigDecimal("10.00"),
                    "kg",
                    "Standard commissary production recipe for Signature Rendang",
                    List.of(
                            new CreateRecipeRequest.ItemRequest(rawIngredient1.getId(), new BigDecimal("12.00"), "kg", "Trimmed beef"),
                            new CreateRecipeRequest.ItemRequest(rawIngredient2.getId(), new BigDecimal("3.00"), "kg", "Pre-cooked spice paste")
                    )
            );

            MvcResult recipeResult = mockMvc.perform(post("/api/production/recipes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(recipeRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.code", is(recipeRequest.code())))
                    .andExpect(jsonPath("$.targetProductName", is(targetProduct.getName())))
                    .andExpect(jsonPath("$.items", hasSize(2)))
                    .andReturn();

            Map<?, ?> createdRecipe = objectMapper.readValue(recipeResult.getResponse().getContentAsString(), Map.class);
            UUID recipeId = UUID.fromString((String) createdRecipe.get("id"));

            // 2. Issue Production Work Order for 20 kg (scaling factor = 2.0)
            CreateProductionOrderRequest orderRequest = new CreateProductionOrderRequest(
                    recipeId,
                    kitchenWarehouse.getId(),
                    new BigDecimal("20.00"),
                    "Urgent weekend batch replenishment",
                    "Head Chef Bambang"
            );

            MvcResult orderResult = mockMvc.perform(post("/api/production/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(orderRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.orderNumber", startsWith("WO-")))
                    .andExpect(jsonPath("$.status", is("PLANNED")))
                    .andExpect(jsonPath("$.plannedQuantity", is(20.00)))
                    .andExpect(jsonPath("$.items", hasSize(2)))
                    .andExpect(jsonPath("$.items[?(@.ingredientProductCode == '" + rawIngredient1.getCode() + "')].plannedQuantity", hasItem(24.0))) // 12 * 2
                    .andExpect(jsonPath("$.items[?(@.ingredientProductCode == '" + rawIngredient2.getCode() + "')].plannedQuantity", hasItem(6.0)))  // 3 * 2
                    .andReturn();

            Map<?, ?> createdOrder = objectMapper.readValue(orderResult.getResponse().getContentAsString(), Map.class);
            UUID orderId = UUID.fromString((String) createdOrder.get("id"));

            // Check stocks prior to completion
            BigDecimal initialTargetStock = stockRepository.findByProductIdAndWarehouseId(targetProduct.getId(), kitchenWarehouse.getId())
                    .map(s -> s.getQuantity()).orElse(BigDecimal.ZERO);
            BigDecimal initialBeefStock = stockRepository.findByProductIdAndWarehouseId(rawIngredient1.getId(), kitchenWarehouse.getId())
                    .map(s -> s.getQuantity()).orElse(BigDecimal.ZERO);
            BigDecimal initialSpiceStock = stockRepository.findByProductIdAndWarehouseId(rawIngredient2.getId(), kitchenWarehouse.getId())
                    .map(s -> s.getQuantity()).orElse(BigDecimal.ZERO);

            // 3. Start Production Work Order
            mockMvc.perform(patch("/api/production/orders/" + orderId + "/start"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
                    .andExpect(jsonPath("$.startDate", notNullValue()));

            // 4. Complete Production Work Order with actual produced quantity = 20 kg
            CompleteProductionOrderRequest completeRequest = new CompleteProductionOrderRequest(
                    new BigDecimal("20.00"),
                    List.of(
                            new CompleteProductionOrderRequest.ConsumedItemRequest(rawIngredient1.getId(), new BigDecimal("24.00")),
                            new CompleteProductionOrderRequest.ConsumedItemRequest(rawIngredient2.getId(), new BigDecimal("6.00"))
                    ),
                    "Production completed with zero waste"
            );

            mockMvc.perform(post("/api/production/orders/" + orderId + "/complete")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(completeRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("COMPLETED")))
                    .andExpect(jsonPath("$.actualQuantity", is(20.00)))
                    .andExpect(jsonPath("$.completedDate", notNullValue()));

            // 5. Verify Inventory Stock Movements:
            // - Finished Goods stock increased by 20.00
            BigDecimal newTargetStock = stockRepository.findByProductIdAndWarehouseId(targetProduct.getId(), kitchenWarehouse.getId())
                    .map(s -> s.getQuantity()).orElse(BigDecimal.ZERO);
            assertThat(newTargetStock).isEqualByComparingTo(initialTargetStock.add(new BigDecimal("20.00")));

            // - Beef stock decreased by 24.00
            BigDecimal newBeefStock = stockRepository.findByProductIdAndWarehouseId(rawIngredient1.getId(), kitchenWarehouse.getId())
                    .map(s -> s.getQuantity()).orElse(BigDecimal.ZERO);
            assertThat(newBeefStock).isEqualByComparingTo(initialBeefStock.subtract(new BigDecimal("24.00")));

            // - Spice stock decreased by 6.00
            BigDecimal newSpiceStock = stockRepository.findByProductIdAndWarehouseId(rawIngredient2.getId(), kitchenWarehouse.getId())
                    .map(s -> s.getQuantity()).orElse(BigDecimal.ZERO);
            assertThat(newSpiceStock).isEqualByComparingTo(initialSpiceStock.subtract(new BigDecimal("6.00")));
        }
    }
}
