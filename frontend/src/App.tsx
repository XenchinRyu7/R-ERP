import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, ActivePage } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { UsersPage } from './pages/UsersPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PartnersPage } from './pages/PartnersPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { ProcurementPage } from './pages/ProcurementPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';
import { ProductionPage } from './pages/ProductionPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { erpApi } from './api/erpApi';
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
  AuthUser,
} from './types/erp';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('food_erp_user');
    const token = localStorage.getItem('food_erp_token');
    if (saved && token) {
      try {
        return JSON.parse(saved) as AuthUser;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Core Data States
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);

  // Cross-page action state (e.g. from PO -> Receive in Inventory)
  const [preselectedPo, setPreselectedPo] = useState<PurchaseOrder | null>(null);

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Load all ERP data
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const promises: Promise<unknown>[] = [
        erpApi.getDashboardMetrics(),
        erpApi.getCategories(),
        erpApi.getProducts(),
        erpApi.getSuppliers(),
        erpApi.getCustomers(),
        erpApi.getWarehouses(),
        erpApi.getPurchaseOrders(),
        erpApi.getGoodsReceipts(),
        erpApi.getStocks(),
        erpApi.getTransactions(),
        erpApi.getSalesOrders(),
        erpApi.getRecipes(),
        erpApi.getProductionOrders(),
      ];

      // Fetch users if superadmin
      if (currentUser.role === 'SUPERADMIN') {
        promises.push(erpApi.getUsers());
      }

      const results = await Promise.allSettled(promises);

      const [
        metricsRes,
        catRes,
        prodRes,
        supRes,
        custRes,
        whRes,
        poRes,
        grRes,
        stockRes,
        txRes,
        soRes,
        recipesRes,
        prodOrdersRes,
      ] = results;

      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value as DashboardMetrics);
      if (catRes.status === 'fulfilled') setCategories(catRes.value as ProductCategory[]);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value as Product[]);
      if (supRes.status === 'fulfilled') setSuppliers(supRes.value as Supplier[]);
      if (custRes.status === 'fulfilled') setCustomers(custRes.value as Customer[]);
      if (whRes.status === 'fulfilled') setWarehouses(whRes.value as Warehouse[]);
      if (poRes.status === 'fulfilled') setPurchaseOrders(poRes.value as PurchaseOrder[]);
      if (grRes.status === 'fulfilled') setGoodsReceipts(grRes.value as GoodsReceipt[]);
      if (stockRes.status === 'fulfilled') setStocks(stockRes.value as InventoryStock[]);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value as InventoryTransaction[]);
      if (soRes.status === 'fulfilled') setSalesOrders(soRes.value as SalesOrder[]);
      if (recipesRes.status === 'fulfilled') setRecipes(recipesRes.value as Recipe[]);
      if (prodOrdersRes.status === 'fulfilled') setProductionOrders(prodOrdersRes.value as ProductionOrder[]);

      if (currentUser.role === 'SUPERADMIN' && results[13]?.status === 'fulfilled') {
        setUsers(results[13].value as AuthUser[]);
      }
    } catch (err) {
      console.error('Failed to load ERP data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser, token: string) => {
    localStorage.setItem('food_erp_token', token);
    localStorage.setItem('food_erp_user', JSON.stringify(user));
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('food_erp_token');
    localStorage.removeItem('food_erp_user');
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  // Handler for quick actions from Dashboard or Procurement
  const handleQuickAction = (action: string) => {
    if (action === 'create_po') {
      setActivePage('procurement');
    } else if (action === 'receive_goods') {
      setActivePage('inventory');
    } else if (action === 'create_so') {
      setActivePage('sales');
    }
  };

  const handleOpenReceiveFromPo = (po: PurchaseOrder) => {
    setPreselectedPo(po);
    setActivePage('inventory');
  };

  const getPageMeta = () => {
    switch (activePage) {
      case 'dashboard':
        return { title: 'Operational Dashboard', subtitle: 'Real-time overview of inventory, procurement, and branch orders' };
      case 'users':
        return { title: 'User & Mitra Approvals', subtitle: 'Manage staff credentials, approve new mitra outlets, and assign vendor access' };
      case 'products':
        return { title: 'Product Catalog', subtitle: 'Manage materials, food ingredients, prices, and safety thresholds' };
      case 'categories':
        return { title: 'Product Categories', subtitle: 'Classify raw meats, seafood, fresh produce, spices, and packaging' };
      case 'partners':
        return { title: 'Suppliers & Restaurant Outlets', subtitle: 'Vendor contacts, restaurant branches, and distribution endpoints' };
      case 'warehouses':
        return { title: 'Warehouses & Cold Storages', subtitle: 'Storage hubs, temperature zones, and capacity metrics' };
      case 'procurement':
        return { title: 'Procurement Management', subtitle: 'Purchase orders, supplier approvals, and receiving status' };
      case 'inventory':
        return { title: 'Inventory & Receiving', subtitle: 'Live warehouse stock balances, low stock alerts, and goods receipts' };
      case 'production':
        return { title: 'Central Kitchen & Production', subtitle: 'Standard recipe BOMs, commissary batch work orders, and automatic ingredient stock conversions' };
      case 'sales':
        return { title: 'Restaurant Branch Orders', subtitle: 'Central kitchen commissary dispatches to restaurant outlets' };
      case 'transactions':
        return { title: 'Stock Movement Ledger', subtitle: 'Audit log of all inbound receipts, outbound sales, and stock adjustments' };
      default:
        return { title: 'Food ERP', subtitle: 'Integrated Business Management System' };
    }
  };

  // If user is not logged in, render the login page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const pageMeta = getPageMeta();
  const lowStockCount = stocks.filter((s) => s.isLowStock).length;
  const activePoCount = purchaseOrders.filter((p) => p.status === 'SUBMITTED' || p.status === 'APPROVED').length;
  const pendingApprovalsCount = users.filter((u) => u.status === 'PENDING_APPROVAL').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        pendingApprovalsCount={pendingApprovalsCount}
        lowStockCount={lowStockCount}
        activePoCount={activePoCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onRefresh={loadData}
          isLoading={isLoading}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigate={setActivePage}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activePage === 'dashboard' && (
              <DashboardPage
                metrics={metrics}
                onNavigate={setActivePage}
                onQuickAction={handleQuickAction}
              />
            )}
            {activePage === 'users' && currentUser.role === 'SUPERADMIN' && (
              <UsersPage
                users={users}
                customers={customers}
                suppliers={suppliers}
                onRefresh={loadData}
              />
            )}
            {activePage === 'products' && (
              <ProductsPage
                products={products}
                categories={categories}
                onRefresh={loadData}
              />
            )}
            {activePage === 'categories' && (
              <CategoriesPage
                categories={categories}
                onRefresh={loadData}
              />
            )}
            {activePage === 'partners' && (
              <PartnersPage
                suppliers={suppliers}
                customers={customers}
                onRefresh={loadData}
              />
            )}
            {activePage === 'warehouses' && (
              <WarehousesPage
                warehouses={warehouses}
                stocks={stocks}
                onRefresh={loadData}
              />
            )}
            {activePage === 'procurement' && (
              <ProcurementPage
                purchaseOrders={purchaseOrders}
                suppliers={suppliers}
                products={products}
                warehouses={warehouses}
                onRefresh={loadData}
                onOpenReceive={handleOpenReceiveFromPo}
              />
            )}
            {activePage === 'inventory' && (
              <InventoryPage
                stocks={stocks}
                receipts={goodsReceipts}
                warehouses={warehouses}
                products={products}
                purchaseOrders={purchaseOrders}
                onRefresh={loadData}
                preselectedPoForReceive={preselectedPo}
                onClearPreselectedPo={() => setPreselectedPo(null)}
              />
            )}
            {activePage === 'production' && (
              <ProductionPage
                recipes={recipes}
                productionOrders={productionOrders}
                products={products}
                warehouses={warehouses}
                onRefresh={loadData}
              />
            )}
            {activePage === 'sales' && (
              <SalesPage
                salesOrders={salesOrders}
                customers={customers}
                warehouses={warehouses}
                products={products}
                onRefresh={loadData}
              />
            )}
            {activePage === 'transactions' && (
              <TransactionsPage
                transactions={transactions}
                onRefresh={loadData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
