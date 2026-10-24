import {
  ProductCategory,
  Product,
  Supplier,
  Customer,
  Warehouse,
  PurchaseOrder,
  GoodsReceipt,
  InventoryStock,
  InventoryTransaction,
  SalesOrder,
  DashboardMetrics,
  Recipe,
  ProductionOrder,
} from '../types/erp';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const erpApi = {
  // Dashboard Analytics
  getDashboardMetrics: () => fetchJson<DashboardMetrics>('/analytics/dashboard'),

  // Master Data - Categories
  getCategories: () => fetchJson<ProductCategory[]>('/master-data/categories'),
  createCategory: (data: Partial<ProductCategory>) =>
    fetchJson<ProductCategory>('/master-data/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<ProductCategory>) =>
    fetchJson<ProductCategory>(`/master-data/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    fetchJson<void>(`/master-data/categories/${id}`, { method: 'DELETE' }),

  // Master Data - Products
  getProducts: () => fetchJson<Product[]>('/master-data/products'),
  createProduct: (data: Partial<Product>) =>
    fetchJson<Product>('/master-data/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Partial<Product>) =>
    fetchJson<Product>(`/master-data/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    fetchJson<void>(`/master-data/products/${id}`, { method: 'DELETE' }),

  // Master Data - Suppliers
  getSuppliers: () => fetchJson<Supplier[]>('/master-data/suppliers'),
  createSupplier: (data: Partial<Supplier>) =>
    fetchJson<Supplier>('/master-data/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSupplier: (id: string, data: Partial<Supplier>) =>
    fetchJson<Supplier>(`/master-data/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSupplier: (id: string) =>
    fetchJson<void>(`/master-data/suppliers/${id}`, { method: 'DELETE' }),

  // Master Data - Customers
  getCustomers: () => fetchJson<Customer[]>('/master-data/customers'),
  createCustomer: (data: Partial<Customer>) =>
    fetchJson<Customer>('/master-data/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    fetchJson<Customer>(`/master-data/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCustomer: (id: string) =>
    fetchJson<void>(`/master-data/customers/${id}`, { method: 'DELETE' }),

  // Master Data - Warehouses
  getWarehouses: () => fetchJson<Warehouse[]>('/master-data/warehouses'),
  createWarehouse: (data: Partial<Warehouse>) =>
    fetchJson<Warehouse>('/master-data/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateWarehouse: (id: string, data: Partial<Warehouse>) =>
    fetchJson<Warehouse>(`/master-data/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteWarehouse: (id: string) =>
    fetchJson<void>(`/master-data/warehouses/${id}`, { method: 'DELETE' }),

  // Procurement
  getPurchaseOrders: () => fetchJson<PurchaseOrder[]>('/procurement/orders'),
  getPurchaseOrderById: (id: string) => fetchJson<PurchaseOrder>(`/procurement/orders/${id}`),
  createPurchaseOrder: (data: {
    supplierId: string;
    notes?: string;
    createdBy?: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  }) =>
    fetchJson<PurchaseOrder>('/procurement/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePurchaseOrderStatus: (id: string, status: string) =>
    fetchJson<PurchaseOrder>(`/procurement/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Inventory
  getStocks: (warehouseId?: string) =>
    fetchJson<InventoryStock[]>(`/inventory/stocks${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  getLowStockAlerts: () => fetchJson<InventoryStock[]>('/inventory/stocks/low'),
  getGoodsReceipts: () => fetchJson<GoodsReceipt[]>('/inventory/receipts'),
  createGoodsReceipt: (data: {
    purchaseOrderId?: string;
    warehouseId: string;
    notes?: string;
    receivedBy?: string;
    items: Array<{ productId: string; quantity: number; unitCost: number }>;
  }) =>
    fetchJson<GoodsReceipt>('/inventory/receipts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  adjustStock: (data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    notes?: string;
  }) =>
    fetchJson<InventoryStock>('/inventory/stocks/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTransactions: () => fetchJson<InventoryTransaction[]>('/inventory/transactions'),

  // Sales Orders
  getSalesOrders: () => fetchJson<SalesOrder[]>('/sales/orders'),
  getSalesOrderById: (id: string) => fetchJson<SalesOrder>(`/sales/orders/${id}`),
  createSalesOrder: (data: {
    customerId: string;
    warehouseId: string;
    notes?: string;
    createdBy?: string;
    items: Array<{ productId: string; quantity: number; unitPrice?: number }>;
  }) =>
    fetchJson<SalesOrder>('/sales/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSalesOrderStatus: (id: string, status: string) =>
    fetchJson<SalesOrder>(`/sales/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Central Kitchen & Production (BOM)
  getRecipes: () => fetchJson<Recipe[]>('/production/recipes'),
  getRecipeById: (id: string) => fetchJson<Recipe>(`/production/recipes/${id}`),
  createRecipe: (data: {
    code?: string;
    name: string;
    targetProductId: string;
    yieldQuantity: number;
    unit: string;
    description?: string;
    items: Array<{
      ingredientProductId: string;
      quantity: number;
      unit: string;
      notes?: string;
    }>;
  }) =>
    fetchJson<Recipe>('/production/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProductionOrders: () => fetchJson<ProductionOrder[]>('/production/orders'),
  getProductionOrderById: (id: string) => fetchJson<ProductionOrder>(`/production/orders/${id}`),
  createProductionOrder: (data: {
    recipeId: string;
    warehouseId: string;
    plannedQuantity: number;
    notes?: string;
    createdBy?: string;
  }) =>
    fetchJson<ProductionOrder>('/production/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  startProductionOrder: (id: string) =>
    fetchJson<ProductionOrder>(`/production/orders/${id}/start`, {
      method: 'PATCH',
    }),
  completeProductionOrder: (
    id: string,
    data?: {
      actualProducedQuantity?: number;
      consumedItems?: Array<{ ingredientProductId: string; actualQuantity: number }>;
      notes?: string;
    }
  ) =>
    fetchJson<ProductionOrder>(`/production/orders/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  cancelProductionOrder: (id: string, reason?: string) =>
    fetchJson<ProductionOrder>(`/production/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
};
