package com.fooderp.backend.masterdata.service;

import com.fooderp.backend.inventory.entity.*;
import com.fooderp.backend.inventory.repository.GoodsReceiptRepository;
import com.fooderp.backend.inventory.repository.InventoryStockRepository;
import com.fooderp.backend.inventory.repository.InventoryTransactionRepository;
import com.fooderp.backend.masterdata.entity.*;
import com.fooderp.backend.masterdata.repository.*;
import com.fooderp.backend.procurement.entity.PurchaseOrder;
import com.fooderp.backend.procurement.entity.PurchaseOrderItem;
import com.fooderp.backend.procurement.repository.PurchaseOrderRepository;
import com.fooderp.backend.sales.entity.SalesOrder;
import com.fooderp.backend.sales.entity.SalesOrderItem;
import com.fooderp.backend.sales.repository.SalesOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.fooderp.backend.auth.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class MasterDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MasterDataSeeder.class);

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryStockRepository stockRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public MasterDataSeeder(
            ProductCategoryRepository categoryRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository,
            CustomerRepository customerRepository,
            WarehouseRepository warehouseRepository,
            InventoryStockRepository stockRepository,
            InventoryTransactionRepository transactionRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            GoodsReceiptRepository goodsReceiptRepository,
            SalesOrderRepository salesOrderRepository,
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.customerRepository = customerRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockRepository = stockRepository;
        this.transactionRepository = transactionRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsersIfEmpty();

        if (categoryRepository.count() > 0) {
            log.info("Master data already exists, skipping initial seed.");
            return;
        }

        log.info("Seeding initial ERP Data for Food ERP...");

        // 1. Categories
        ProductCategory catMeat = categoryRepository.save(new ProductCategory(UUID.randomUUID(), "CAT-MEAT", "Meat & Poultry", "Daging sapi, ayam, dan olahan hewani", "ACTIVE"));
        ProductCategory catSeafood = categoryRepository.save(new ProductCategory(UUID.randomUUID(), "CAT-SEAFOOD", "Fresh Seafood", "Ikan salmon, udang, cumi segar", "ACTIVE"));
        ProductCategory catVeg = categoryRepository.save(new ProductCategory(UUID.randomUUID(), "CAT-VEG", "Fresh Produce & Herbs", "Sayuran segar, jamur, bumbu dapur segar", "ACTIVE"));
        ProductCategory catDairy = categoryRepository.save(new ProductCategory(UUID.randomUUID(), "CAT-DAIRY", "Dairy & Cheese", "Keju mozzarella, butter, susu segar", "ACTIVE"));
        ProductCategory catDry = categoryRepository.save(new ProductCategory(UUID.randomUUID(), "CAT-DRY", "Dry Ingredients & Grains", "Beras jepang, tepung, saus, minyak", "ACTIVE"));
        ProductCategory catPack = categoryRepository.save(new ProductCategory(UUID.randomUUID(), "CAT-PACK", "Eco Packaging", "Kotak makanan ramah lingkungan, cup minuman", "ACTIVE"));

        // 2. Products
        Product pWagyu = productRepository.save(new Product(UUID.randomUUID(), "PRD-BEEF-01", "Wagyu Ribeye Slice MB5", catMeat, "KG", new BigDecimal("320000"), new BigDecimal("450000"), 15, "Daging slice premium untuk sukiyaki/grill", "ACTIVE"));
        Product pChicken = productRepository.save(new Product(UUID.randomUUID(), "PRD-CHICK-01", "Chicken Breast Fillet Boneless", catMeat, "KG", new BigDecimal("48000"), new BigDecimal("65000"), 30, "Fillet dada ayam segar tanpa kulit", "ACTIVE"));
        Product pSalmon = productRepository.save(new Product(UUID.randomUUID(), "PRD-SALM-01", "Fresh Atlantic Salmon Fillet", catSeafood, "KG", new BigDecimal("260000"), new BigDecimal("350000"), 10, "Salmon sashimi grade segar Norwegia", "ACTIVE"));
        Product pPrawn = productRepository.save(new Product(UUID.randomUUID(), "PRD-PRAWN-01", "Tiger Prawn Jumbo", catSeafood, "KG", new BigDecimal("140000"), new BigDecimal("190000"), 12, "Udang windu ukuran 20-25 ekor/kg", "ACTIVE"));
        Product pLettuce = productRepository.save(new Product(UUID.randomUUID(), "PRD-LETTUCE-01", "Hydroponic Romaine Lettuce", catVeg, "KG", new BigDecimal("25000"), new BigDecimal("38000"), 20, "Selada segar hidroponik bebas pestisida", "ACTIVE"));
        Product pMushroom = productRepository.save(new Product(UUID.randomUUID(), "PRD-MUSH-01", "Portobello Mushrooms", catVeg, "KG", new BigDecimal("65000"), new BigDecimal("95000"), 8, "Jamur segar pilihan untuk menu grill & steak", "ACTIVE"));
        Product pCheese = productRepository.save(new Product(UUID.randomUUID(), "PRD-CHEESE-01", "Fior di Latte Mozzarella", catDairy, "KG", new BigDecimal("115000"), new BigDecimal("160000"), 25, "Keju mozzarella leleh kualitas pizza Neapolitan", "ACTIVE"));
        Product pRice = productRepository.save(new Product(UUID.randomUUID(), "PRD-RICE-01", "Koshihikari Japanese Rice 25kg", catDry, "BAG", new BigDecimal("550000"), new BigDecimal("720000"), 10, "Beras pulen Jepang karung 25kg", "ACTIVE"));
        Product pTruffle = productRepository.save(new Product(UUID.randomUUID(), "PRD-TRUFFLE-01", "White Truffle Infused Olive Oil 500ml", catDry, "BOTTLE", new BigDecimal("210000"), new BigDecimal("295000"), 5, "Minyak truffle aroma intens dari Italia", "ACTIVE"));
        Product pBox = productRepository.save(new Product(UUID.randomUUID(), "PRD-BOX-01", "Kraft Lunch Box 1000ml (50pcs)", catPack, "PACK", new BigDecimal("85000"), new BigDecimal("115000"), 40, "Kemasan makanan tahan panas & minyak", "ACTIVE"));

        // 3. Suppliers
        Supplier sBoga = supplierRepository.save(new Supplier(UUID.randomUUID(), "SUP-BPN-01", "PT Boga Prima Nusantara", "order@bogaprima.co.id", "+62 21 555-0101", "Jl. Industri Daging Kav. 4, Jakarta Barat", "ACTIVE"));
        Supplier sSamudera = supplierRepository.save(new Supplier(UUID.randomUUID(), "SUP-SSJ-02", "CV Samudera Segar Jaya", "sales@samuderasegar.id", "+62 21 555-0202", "Kawasan Pelabuhan Muara Baru Blok D, Jakarta Utara", "ACTIVE"));
        Supplier sTani = supplierRepository.save(new Supplier(UUID.randomUUID(), "SUP-TMO-03", "Koperasi Tani Makmur Organik", "halo@tanimakmur.org", "+62 22 750-3344", "Jl. Raya Lembang No. 120, Bandung Barat", "ACTIVE"));
        Supplier sKemasan = supplierRepository.save(new Supplier(UUID.randomUUID(), "SUP-SKL-04", "PT Sukses Kemasan Lestari", "supply@kemasanlestari.com", "+62 21 890-5566", "Kawasan Industri MM2100, Cikarang", "ACTIVE"));

        // 4. Customers
        Customer cSudirman = customerRepository.save(new Customer(UUID.randomUUID(), "CUST-SDR-01", "Resto Nusantara - Cabang Sudirman", "sudirman@restonusantara.com", "+62 21 299-1001", "Gedung Pacific Place Lt. 5, SCBD Sudirman, Jakarta Selatan", "ACTIVE"));
        Customer cSenopati = customerRepository.save(new Customer(UUID.randomUUID(), "CUST-SNP-02", "Resto Nusantara - Cabang Senopati", "senopati@restonusantara.com", "+62 21 720-2002", "Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan", "ACTIVE"));
        Customer cPik = customerRepository.save(new Customer(UUID.randomUUID(), "CUST-PIK-03", "Bistro Tokyo Dining - PIK Pantjoran", "manager.pik@tokyodining.id", "+62 21 300-3003", "Pantjoran PIK Arcade Unit 12, Jakarta Utara", "ACTIVE"));
        Customer cBandung = customerRepository.save(new Customer(UUID.randomUUID(), "CUST-BDG-04", "Grand Terrace Cafe & Bistro", "procurement@grandterrace.co.id", "+62 22 423-4004", "Jl. Ir. H. Juanda No. 88 (Dago), Bandung", "ACTIVE"));

        // 5. Warehouses
        Warehouse whCold = warehouseRepository.save(new Warehouse(UUID.randomUUID(), "WH-COLD-01", "Central Cold Storage Tanjung Priok", "Jl. Jampea No. 18, Tanjung Priok, Jakarta Utara", "ACTIVE"));
        Warehouse whDry = warehouseRepository.save(new Warehouse(UUID.randomUUID(), "WH-DRY-02", "Central Dry Distribution Hub Bekasi", "Kawasan Pergudangan Delta Mas Blok A3, Bekasi", "ACTIVE"));
        Warehouse whKitchen = warehouseRepository.save(new Warehouse(UUID.randomUUID(), "WH-KITCHEN-03", "Central Commissary Kitchen SCBD", "Kawasan SCBD Lot 8, Jakarta Selatan", "ACTIVE"));

        // 6. Initial Inventory Stocks
        stockRepository.saveAll(List.of(
                new InventoryStock(UUID.randomUUID(), pWagyu, whCold, new BigDecimal("45.5")),
                new InventoryStock(UUID.randomUUID(), pChicken, whCold, new BigDecimal("120.0")),
                new InventoryStock(UUID.randomUUID(), pSalmon, whCold, new BigDecimal("8.0")), // Low stock alert! (min 10)
                new InventoryStock(UUID.randomUUID(), pPrawn, whCold, new BigDecimal("35.0")),
                new InventoryStock(UUID.randomUUID(), pLettuce, whKitchen, new BigDecimal("50.0")),
                new InventoryStock(UUID.randomUUID(), pMushroom, whKitchen, new BigDecimal("5.0")), // Low stock alert! (min 8)
                new InventoryStock(UUID.randomUUID(), pCheese, whCold, new BigDecimal("80.0")),
                new InventoryStock(UUID.randomUUID(), pRice, whDry, new BigDecimal("40.0")),
                new InventoryStock(UUID.randomUUID(), pTruffle, whDry, new BigDecimal("15.0")),
                new InventoryStock(UUID.randomUUID(), pBox, whDry, new BigDecimal("120.0"))
        ));

        // 7. Initial Transactions Log
        transactionRepository.saveAll(List.of(
                new InventoryTransaction(UUID.randomUUID(), pWagyu, whCold, "IN_PURCHASE", new BigDecimal("50.0"), "GR-INIT-001", "Initial stock setup"),
                new InventoryTransaction(UUID.randomUUID(), pSalmon, whCold, "IN_PURCHASE", new BigDecimal("20.0"), "GR-INIT-002", "Initial stock setup"),
                new InventoryTransaction(UUID.randomUUID(), pSalmon, whCold, "OUT_SALES", new BigDecimal("-12.0"), "SO-INIT-001", "Delivered to Bistro Tokyo Dining"),
                new InventoryTransaction(UUID.randomUUID(), pChicken, whCold, "IN_PURCHASE", new BigDecimal("150.0"), "GR-INIT-003", "Bulk delivery from supplier"),
                new InventoryTransaction(UUID.randomUUID(), pChicken, whCold, "OUT_SALES", new BigDecimal("-30.0"), "SO-INIT-002", "Dispatch to Resto Senopati")
        ));

        // 8. Sample Purchase Orders
        PurchaseOrder po1 = new PurchaseOrder(UUID.randomUUID(), "PO-2026-001", sBoga, LocalDateTime.now().minusDays(3), "RECEIVED", new BigDecimal("16000000"), "Urgent wagyu replenish", "Admin");
        po1.addItem(new PurchaseOrderItem(UUID.randomUUID(), po1, pWagyu, new BigDecimal("50"), new BigDecimal("320000"), new BigDecimal("50")));
        purchaseOrderRepository.save(po1);

        PurchaseOrder po2 = new PurchaseOrder(UUID.randomUUID(), "PO-2026-002", sSamudera, LocalDateTime.now().minusDays(1), "APPROVED", new BigDecimal("5200000"), "Restock Salmon & Tiger Prawns", "Purchasing Staff");
        po2.addItem(new PurchaseOrderItem(UUID.randomUUID(), po2, pSalmon, new BigDecimal("20"), new BigDecimal("260000"), BigDecimal.ZERO));
        purchaseOrderRepository.save(po2);

        // 9. Sample Goods Receipt
        GoodsReceipt gr1 = new GoodsReceipt(UUID.randomUUID(), "GR-2026-001", po1, whCold, LocalDateTime.now().minusDays(2), "COMPLETED", "Quality check passed, chilled properly", "QC Supervisor");
        gr1.addItem(new GoodsReceiptItem(UUID.randomUUID(), gr1, pWagyu, new BigDecimal("50"), new BigDecimal("320000")));
        goodsReceiptRepository.save(gr1);

        // 10. Sample Sales Order
        SalesOrder so1 = new SalesOrder(UUID.randomUUID(), "SO-2026-001", cPik, whCold, LocalDateTime.now().minusDays(1), "DELIVERED", new BigDecimal("4200000"), "Weekly sushi ingredients delivery", "Sales Rep");
        so1.addItem(new SalesOrderItem(UUID.randomUUID(), so1, pSalmon, new BigDecimal("12"), new BigDecimal("350000")));
        salesOrderRepository.save(so1);

        log.info("Food ERP comprehensive data seeded successfully!");
    }

    private void seedUsersIfEmpty() {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Seeding default ERP staff & partner accounts for all 6 roles...");

        Customer sampleCustomer = customerRepository.findAll().stream().findFirst().orElse(null);
        Supplier sampleSupplier = supplierRepository.findAll().stream().findFirst().orElse(null);
        Warehouse whCold = warehouseRepository.findByCode("WH-COLD-01").orElse(null);
        Warehouse whDry = warehouseRepository.findByCode("WH-DRY-02").orElse(null);
        Warehouse whKitchen = warehouseRepository.findByCode("WH-KITCHEN-03").orElse(null);

        // 1. Superadmin
        com.fooderp.backend.auth.entity.AppUser admin = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "admin",
                "admin@fooderp.com",
                passwordEncoder.encode("admin123"),
                "Chief Executive Administrator",
                com.fooderp.backend.auth.entity.UserRole.SUPERADMIN,
                "+62 811-0000-001",
                com.fooderp.backend.auth.entity.UserStatus.ACTIVE,
                null,
                null
        );

        // 2. Kitchen Manager
        com.fooderp.backend.auth.entity.AppUser chef = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "chef.juna",
                "chef@fooderp.com",
                passwordEncoder.encode("kitchen123"),
                "Executive Chef Juna",
                com.fooderp.backend.auth.entity.UserRole.KITCHEN_MANAGER,
                "+62 811-0000-002",
                com.fooderp.backend.auth.entity.UserStatus.ACTIVE,
                null,
                null
        );
        chef.setWarehouse(whKitchen);

        // 3. Warehouse & Logistics Supervisor (HQ / All Facilities)
        com.fooderp.backend.auth.entity.AppUser warehouse = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "warehouse.budi",
                "warehouse@fooderp.com",
                passwordEncoder.encode("warehouse123"),
                "Logistics Supervisor Budi",
                com.fooderp.backend.auth.entity.UserRole.WAREHOUSE_LOGISTICS,
                "+62 811-0000-003",
                com.fooderp.backend.auth.entity.UserStatus.ACTIVE,
                null,
                null
        );
        // Budi has null warehouse meaning Central Supervisor (access to all facilities)

        // 3b. Dedicated Cold Storage Staff (WH-COLD-01 Priok)
        com.fooderp.backend.auth.entity.AppUser whColdStaff = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "warehouse.agus",
                "wh.cold@fooderp.com",
                passwordEncoder.encode("warehouse123"),
                "Agus Santoso (Cold Storage Op)",
                com.fooderp.backend.auth.entity.UserRole.WAREHOUSE_LOGISTICS,
                "+62 811-0000-005",
                com.fooderp.backend.auth.entity.UserStatus.ACTIVE,
                null,
                null
        );
        whColdStaff.setWarehouse(whCold);

        // 3c. Dedicated Dry Hub Staff (WH-DRY-02 Bekasi)
        com.fooderp.backend.auth.entity.AppUser whDryStaff = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "warehouse.bambang",
                "wh.dry@fooderp.com",
                passwordEncoder.encode("warehouse123"),
                "Bambang Wijaya (Dry Hub Op)",
                com.fooderp.backend.auth.entity.UserRole.WAREHOUSE_LOGISTICS,
                "+62 811-0000-006",
                com.fooderp.backend.auth.entity.UserStatus.ACTIVE,
                null,
                null
        );
        whDryStaff.setWarehouse(whDry);

        // 4. Procurement Officer
        com.fooderp.backend.auth.entity.AppUser procure = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "procure.siti",
                "procurement@fooderp.com",
                passwordEncoder.encode("procure123"),
                "Procurement Lead Siti",
                com.fooderp.backend.auth.entity.UserRole.PROCUREMENT_OFFICER,
                "+62 811-0000-004",
                com.fooderp.backend.auth.entity.UserStatus.ACTIVE,
                null,
                null
        );

        // 5. Active Mitra Outlet (Resto Branch)
        com.fooderp.backend.auth.entity.AppUser mitraActive = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "mitra.senopati",
                "mitra.senopati@resto.com",
                passwordEncoder.encode("mitra123"),
                "Manager Outlet Senopati",
                com.fooderp.backend.auth.entity.UserRole.MITRA_OUTLET,
                "+62 812-3333-001",
                com.fooderp.backend.auth.entity.UserStatus.ACTIVE,
                "OUTLET",
                "Tokyo Dining Senopati Outlet"
        );
        mitraActive.setCustomer(sampleCustomer);
        mitraActive.setApprovedBy("System Auto-Seed");
        mitraActive.setApprovedAt(LocalDateTime.now().minusDays(5));

        // 6. Active Supplier Vendor Partner
        com.fooderp.backend.auth.entity.AppUser vendorActive = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "vendor.boga",
                "vendor.boga@supplier.com",
                passwordEncoder.encode("vendor123"),
                "Sales Lead Boga Prima",
                com.fooderp.backend.auth.entity.UserRole.SUPPLIER_VENDOR,
                "+62 813-4444-002",
                com.fooderp.backend.auth.entity.UserStatus.ACTIVE,
                "VENDOR",
                "PT Boga Prima Nusantara"
        );
        vendorActive.setSupplier(sampleSupplier);
        vendorActive.setApprovedBy("System Auto-Seed");
        vendorActive.setApprovedAt(LocalDateTime.now().minusDays(5));

        // 7. Pending Mitra Registration (waiting for Superadmin approval)
        com.fooderp.backend.auth.entity.AppUser mitraPending = new com.fooderp.backend.auth.entity.AppUser(
                UUID.randomUUID(),
                "mitra.menteng",
                "mitra.menteng@resto.com",
                passwordEncoder.encode("mitra123"),
                "Owner Franchise Menteng",
                com.fooderp.backend.auth.entity.UserRole.MITRA_OUTLET,
                "+62 819-9999-003",
                com.fooderp.backend.auth.entity.UserStatus.PENDING_APPROVAL,
                "OUTLET",
                "Menteng Gourmet Bistro Franchise"
        );
        mitraPending.setApprovalNotes("Newly applied franchise outlet in Menteng, awaits MOA verification");

        userRepository.saveAll(List.of(admin, chef, warehouse, whColdStaff, whDryStaff, procure, mitraActive, vendorActive, mitraPending));
        log.info("Default ERP staff and partner accounts seeded successfully!");
    }
}
