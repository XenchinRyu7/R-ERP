package com.fooderp.backend.production.repository;

import com.fooderp.backend.production.entity.ProductionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, UUID> {
    Optional<ProductionOrder> findByOrderNumber(String orderNumber);
    List<ProductionOrder> findByStatus(String status);
    List<ProductionOrder> findByWarehouseId(UUID warehouseId);
    List<ProductionOrder> findAllByOrderByCreatedAtDesc();
}
