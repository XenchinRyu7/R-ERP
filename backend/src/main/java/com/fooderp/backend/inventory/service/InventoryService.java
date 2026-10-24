package com.fooderp.backend.inventory.service;

import com.fooderp.backend.inventory.dto.*;
import com.fooderp.backend.inventory.entity.*;
import com.fooderp.backend.inventory.repository.GoodsReceiptRepository;
import com.fooderp.backend.inventory.repository.InventoryStockRepository;
import com.fooderp.backend.inventory.repository.InventoryTransactionRepository;
import com.fooderp.backend.masterdata.entity.Product;
import com.fooderp.backend.masterdata.entity.Warehouse;
import com.fooderp.backend.masterdata.repository.ProductRepository;
import com.fooderp.backend.masterdata.repository.WarehouseRepository;
import com.fooderp.backend.procurement.entity.PurchaseOrder;
import com.fooderp.backend.procurement.entity.PurchaseOrderItem;
import com.fooderp.backend.procurement.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final InventoryStockRepository stockRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public InventoryService(
            GoodsReceiptRepository goodsReceiptRepository,
            InventoryStockRepository stockRepository,
            InventoryTransactionRepository transactionRepository,
            ProductRepository productRepository,
            WarehouseRepository warehouseRepository,
            PurchaseOrderRepository purchaseOrderRepository) {
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.stockRepository = stockRepository;
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    // ================= GOODS RECEIPT =================
    public GoodsReceiptDto createGoodsReceipt(CreateGoodsReceiptRequest request) {
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + request.warehouseId()));

        PurchaseOrder po = null;
        if (request.purchaseOrderId() != null) {
            po = purchaseOrderRepository.findById(request.purchaseOrderId()).orElse(null);
        }

        String receiptNumber = "GR-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));

        GoodsReceipt receipt = new GoodsReceipt(
                UUID.randomUUID(),
                receiptNumber,
                po,
                warehouse,
                LocalDateTime.now(),
                "COMPLETED",
                request.notes(),
                request.receivedBy() != null ? request.receivedBy() : "Warehouse Officer"
        );

        for (CreateGoodsReceiptRequest.ItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.productId()));

            BigDecimal unitCost = itemReq.unitCost() != null ? itemReq.unitCost() : product.getPurchasePrice();
            GoodsReceiptItem item = new GoodsReceiptItem(
                    UUID.randomUUID(),
                    receipt,
                    product,
                    itemReq.quantity(),
                    unitCost
            );
            receipt.addItem(item);

            // 1. Update Inventory Stock
            addStock(product, warehouse, itemReq.quantity());

            // 2. Record Transaction
            InventoryTransaction tx = new InventoryTransaction(
                    UUID.randomUUID(),
                    product,
                    warehouse,
                    "IN_PURCHASE",
                    itemReq.quantity(),
                    receiptNumber,
                    "Goods received from PO: " + (po != null ? po.getOrderNumber() : "Direct")
            );
            transactionRepository.save(tx);

            // 3. Update PO received quantity if PO is linked
            if (po != null) {
                for (PurchaseOrderItem poItem : po.getItems()) {
                    if (poItem.getProduct().getId().equals(product.getId())) {
                        BigDecimal newRec = poItem.getReceivedQuantity().add(itemReq.quantity());
                        poItem.setReceivedQuantity(newRec);
                    }
                }
            }
        }

        // Check if PO is fully received
        if (po != null) {
            boolean allReceived = po.getItems().stream()
                    .allMatch(i -> i.getReceivedQuantity().compareTo(i.getQuantity()) >= 0);
            if (allReceived) {
                po.setStatus("RECEIVED");
            } else {
                po.setStatus("PARTIALLY_RECEIVED");
            }
            purchaseOrderRepository.save(po);
        }

        return toDto(goodsReceiptRepository.save(receipt));
    }

    @Transactional(readOnly = true)
    public List<GoodsReceiptDto> getAllGoodsReceipts() {
        return goodsReceiptRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GoodsReceiptDto getGoodsReceiptById(UUID id) {
        return goodsReceiptRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Goods receipt not found with id: " + id));
    }

    // ================= STOCK MANAGEMENT =================
    @Transactional(readOnly = true)
    public List<InventoryStockDto> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(this::toStockDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryStockDto> getStocksByWarehouse(UUID warehouseId) {
        return stockRepository.findByWarehouseId(warehouseId).stream()
                .map(this::toStockDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryStockDto> getLowStockAlerts() {
        return stockRepository.findLowStockItems().stream()
                .map(this::toStockDto)
                .collect(Collectors.toList());
    }

    public void addStock(Product product, Warehouse warehouse, BigDecimal quantity) {
        Optional<InventoryStock> existing = stockRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId());
        InventoryStock stock;
        if (existing.isPresent()) {
            stock = existing.get();
            stock.setQuantity(stock.getQuantity().add(quantity));
        } else {
            stock = new InventoryStock(UUID.randomUUID(), product, warehouse, quantity);
        }
        stockRepository.save(stock);
    }

    public void recordStockMovement(Product product, Warehouse warehouse, BigDecimal quantity, String transactionType, String refNumber, String notes) {
        Optional<InventoryStock> existing = stockRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId());
        InventoryStock stock;
        if (existing.isPresent()) {
            stock = existing.get();
            BigDecimal newQty = stock.getQuantity().add(quantity);
            if (newQty.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Insufficient stock for product " + product.getName() + ". Available: " + stock.getQuantity() + ", requested: " + quantity.abs());
            }
            stock.setQuantity(newQty);
        } else {
            if (quantity.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Insufficient stock for product " + product.getName() + ". Available: 0, requested: " + quantity.abs());
            }
            stock = new InventoryStock(UUID.randomUUID(), product, warehouse, quantity);
        }
        stockRepository.save(stock);

        InventoryTransaction tx = new InventoryTransaction(
                UUID.randomUUID(),
                product,
                warehouse,
                transactionType,
                quantity,
                refNumber,
                notes
        );
        transactionRepository.save(tx);
    }

    public void deductStock(UUID productId, UUID warehouseId, BigDecimal quantity, String refNumber, String notes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));

        InventoryStock stock = stockRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("No stock record found for product in specified warehouse"));

        if (stock.getQuantity().compareTo(quantity) < 0) {
            throw new RuntimeException("Insufficient stock for product " + product.getName() + ". Available: " + stock.getQuantity() + ", requested: " + quantity);
        }

        stock.setQuantity(stock.getQuantity().subtract(quantity));
        stockRepository.save(stock);

        InventoryTransaction tx = new InventoryTransaction(
                UUID.randomUUID(),
                product,
                warehouse,
                "OUT_SALES",
                quantity.negate(),
                refNumber,
                notes
        );
        transactionRepository.save(tx);
    }

    public InventoryStockDto adjustStock(UUID productId, UUID warehouseId, BigDecimal newQuantity, String notes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));

        Optional<InventoryStock> existing = stockRepository.findByProductIdAndWarehouseId(productId, warehouseId);
        InventoryStock stock;
        BigDecimal diff;
        if (existing.isPresent()) {
            stock = existing.get();
            diff = newQuantity.subtract(stock.getQuantity());
            stock.setQuantity(newQuantity);
        } else {
            diff = newQuantity;
            stock = new InventoryStock(UUID.randomUUID(), product, warehouse, newQuantity);
        }
        stock = stockRepository.save(stock);

        InventoryTransaction tx = new InventoryTransaction(
                UUID.randomUUID(),
                product,
                warehouse,
                "ADJUSTMENT",
                diff,
                "ADJ-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")),
                notes
        );
        transactionRepository.save(tx);

        return toStockDto(stock);
    }

    // ================= TRANSACTIONS =================
    @Transactional(readOnly = true)
    public List<InventoryTransactionDto> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toTxDto)
                .collect(Collectors.toList());
    }

    // ================= MAPPERS =================
    private GoodsReceiptDto toDto(GoodsReceipt gr) {
        List<GoodsReceiptItemDto> items = gr.getItems().stream().map(item -> new GoodsReceiptItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getCode(),
                item.getProduct().getName(),
                item.getProduct().getUnit(),
                item.getQuantity(),
                item.getUnitCost(),
                item.getCreatedAt()
        )).collect(Collectors.toList());

        return new GoodsReceiptDto(
                gr.getId(),
                gr.getReceiptNumber(),
                gr.getPurchaseOrder() != null ? gr.getPurchaseOrder().getId() : null,
                gr.getPurchaseOrder() != null ? gr.getPurchaseOrder().getOrderNumber() : null,
                gr.getWarehouse().getId(),
                gr.getWarehouse().getCode(),
                gr.getWarehouse().getName(),
                gr.getReceiptDate(),
                gr.getStatus(),
                gr.getNotes(),
                gr.getReceivedBy(),
                items,
                gr.getCreatedAt()
        );
    }

    private InventoryStockDto toStockDto(InventoryStock stock) {
        boolean isLow = stock.getQuantity().compareTo(BigDecimal.valueOf(stock.getProduct().getMinStock())) <= 0;
        return new InventoryStockDto(
                stock.getId(),
                stock.getProduct().getId(),
                stock.getProduct().getCode(),
                stock.getProduct().getName(),
                stock.getProduct().getCategory() != null ? stock.getProduct().getCategory().getName() : "Uncategorized",
                stock.getProduct().getUnit(),
                stock.getWarehouse().getId(),
                stock.getWarehouse().getCode(),
                stock.getWarehouse().getName(),
                stock.getQuantity(),
                stock.getProduct().getMinStock(),
                isLow,
                stock.getLastUpdatedAt()
        );
    }

    private InventoryTransactionDto toTxDto(InventoryTransaction tx) {
        return new InventoryTransactionDto(
                tx.getId(),
                tx.getProduct().getId(),
                tx.getProduct().getCode(),
                tx.getProduct().getName(),
                tx.getWarehouse().getId(),
                tx.getWarehouse().getCode(),
                tx.getWarehouse().getName(),
                tx.getTransactionType(),
                tx.getQuantity(),
                tx.getReferenceNumber(),
                tx.getNotes(),
                tx.getCreatedAt()
        );
    }
}
