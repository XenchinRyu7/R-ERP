package com.fooderp.backend.production.controller;

import com.fooderp.backend.production.dto.*;
import com.fooderp.backend.production.service.ProductionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/production")
@CrossOrigin(origins = "*")
public class ProductionController {

    private final ProductionService productionService;

    public ProductionController(ProductionService productionService) {
        this.productionService = productionService;
    }

    // ================= RECIPES (BOM) =================

    @GetMapping("/recipes")
    public ResponseEntity<List<RecipeDto>> getAllRecipes() {
        return ResponseEntity.ok(productionService.getAllRecipes());
    }

    @GetMapping("/recipes/{id}")
    public ResponseEntity<RecipeDto> getRecipeById(@PathVariable UUID id) {
        return ResponseEntity.ok(productionService.getRecipeById(id));
    }

    @PostMapping("/recipes")
    public ResponseEntity<RecipeDto> createRecipe(@RequestBody CreateRecipeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productionService.createRecipe(request));
    }

    // ================= PRODUCTION ORDERS =================

    @GetMapping("/orders")
    public ResponseEntity<List<ProductionOrderDto>> getAllProductionOrders() {
        return ResponseEntity.ok(productionService.getAllProductionOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ProductionOrderDto> getProductionOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(productionService.getProductionOrderById(id));
    }

    @PostMapping("/orders")
    public ResponseEntity<ProductionOrderDto> createProductionOrder(@RequestBody CreateProductionOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productionService.createProductionOrder(request));
    }

    @PatchMapping("/orders/{id}/start")
    public ResponseEntity<ProductionOrderDto> startProductionOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(productionService.startProductionOrder(id));
    }

    @PostMapping("/orders/{id}/complete")
    public ResponseEntity<ProductionOrderDto> completeProductionOrder(
            @PathVariable UUID id,
            @RequestBody(required = false) CompleteProductionOrderRequest request) {
        return ResponseEntity.ok(productionService.completeProductionOrder(id, request));
    }

    @PatchMapping("/orders/{id}/cancel")
    public ResponseEntity<ProductionOrderDto> cancelProductionOrder(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null) ? body.get("reason") : null;
        return ResponseEntity.ok(productionService.cancelProductionOrder(id, reason));
    }
}
