export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  minStock: number;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  productCode?: string;
  productName?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity?: number;
  subtotal?: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierCode?: string;
  supplierName?: string;
  orderDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  createdBy?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface GoodsReceiptItem {
  id?: string;
  productId: string;
  productCode?: string;
  productName?: string;
  unit?: string;
  quantity: number;
  unitCost: number;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  warehouseId: string;
  warehouseCode?: string;
  warehouseName?: string;
  receiptDate: string;
  status: string;
  notes?: string;
  receivedBy?: string;
  items: GoodsReceiptItem[];
  createdAt: string;
}

export interface InventoryStock {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  categoryName: string;
  unit: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  minStock: number;
  isLowStock: boolean;
  lastUpdatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  transactionType: 'IN_PURCHASE' | 'OUT_SALES' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  referenceNumber: string;
  notes: string;
  createdAt: string;
}

export interface SalesOrderItem {
  id?: string;
  productId: string;
  productCode?: string;
  productName?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerCode?: string;
  customerName?: string;
  warehouseId: string;
  warehouseCode?: string;
  warehouseName?: string;
  orderDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  createdBy?: string;
  items: SalesOrderItem[];
  createdAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalWarehouses: number;
  lowStockCount: number;
  activePurchaseOrders: number;
  completedSalesOrders: number;
  totalStockValuation: number;
  totalProcurementSpend: number;
  totalSalesRevenue: number;
  lowStockAlerts: InventoryStock[];
  recentPurchaseOrders: PurchaseOrder[];
  recentSalesOrders: SalesOrder[];
  recentTransactions: InventoryTransaction[];
}

export interface RecipeItem {
  id?: string;
  ingredientProductId: string;
  ingredientProductCode?: string;
  ingredientProductName?: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  code: string;
  name: string;
  targetProductId: string;
  targetProductCode?: string;
  targetProductName?: string;
  yieldQuantity: number;
  unit: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  items: RecipeItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProductionOrderItem {
  id?: string;
  ingredientProductId: string;
  ingredientProductCode?: string;
  ingredientProductName?: string;
  plannedQuantity: number;
  actualConsumedQuantity: number;
  unit: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  recipeId: string;
  recipeCode?: string;
  recipeName?: string;
  targetProductId: string;
  targetProductCode?: string;
  targetProductName?: string;
  warehouseId: string;
  warehouseCode?: string;
  warehouseName?: string;
  plannedQuantity: number;
  actualQuantity: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  completedDate?: string;
  notes?: string;
  createdBy?: string;
  items: ProductionOrderItem[];
  createdAt: string;
  updatedAt?: string;
}
