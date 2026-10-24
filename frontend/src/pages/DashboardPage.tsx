import React from 'react';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Warehouse as WarehouseIcon,
  Boxes,
  Truck,
  Plus,
  Store,
  ChefHat,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  FileText,
  BadgeCheck,
  Building,
  History,
  Users
} from 'lucide-react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import {
  DashboardMetrics,
  AuthUser,
  SalesOrder,
  Product,
  PurchaseOrder,
  Recipe,
  ProductionOrder,
  InventoryStock,
  Warehouse
} from '../types/erp';
import { ActivePage } from '../components/Sidebar';

interface DashboardPageProps {
  metrics: DashboardMetrics | null;
  currentUser?: AuthUser | null;
  salesOrders?: SalesOrder[];
  products?: Product[];
  purchaseOrders?: PurchaseOrder[];
  recipes?: Recipe[];
  productionOrders?: ProductionOrder[];
  stocks?: InventoryStock[];
  warehouses?: Warehouse[];
  onNavigate: (page: ActivePage) => void;
  onQuickAction: (action: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  currentUser,
  salesOrders = [],
  products = [],
  purchaseOrders = [],
  recipes = [],
  productionOrders = [],
  stocks = [],
  warehouses = [],
  onNavigate,
  onQuickAction,
}) => {
  const role = currentUser?.role || 'SUPERADMIN';

  const formatIDR = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // ============================================================================
  // 1. MITRA OUTLET DASHBOARD VIEW
  // ============================================================================
  if (role === 'MITRA_OUTLET') {
    // Filter sales orders for this specific mitra only
    const myOrders = salesOrders.filter((so) => {
      if (currentUser?.customerId && so.customerId === currentUser.customerId) return true;
      if (currentUser?.partnerName && so.customerName && so.customerName.toLowerCase().includes(currentUser.partnerName.toLowerCase())) return true;
      return false;
    });

    const activeOrders = myOrders.filter((so) => so.status === 'CONFIRMED' || so.status === 'SHIPPED' || so.status === 'PENDING');
    const completedOrders = myOrders.filter((so) => so.status === 'DELIVERED');
    const totalSpent = completedOrders.reduce((sum, so) => sum + so.totalAmount, 0);

    const partnerDisplayName = currentUser?.partnerName || currentUser?.customerName || 'Cabang Mitra Baru';

    const mitraCards = [
      {
        title: 'Pesanan Aktif Diproses',
        value: activeOrders.length,
        sub: 'Sedang disiapkan dapur & armada',
        icon: Truck,
        gradient: 'from-blue-600 to-indigo-500',
        action: () => onNavigate('sales'),
      },
      {
        title: 'Pesanan Berhasil Diterima',
        value: completedOrders.length,
        sub: 'Terkirim lengkap ke cabang',
        icon: CheckCircle2,
        gradient: 'from-emerald-600 to-teal-500',
        action: () => onNavigate('sales'),
      },
      {
        title: 'Akumulasi Belanja Pasokan',
        value: formatIDR(totalSpent),
        sub: 'Bulan berjalan',
        icon: DollarSign,
        gradient: 'from-amber-500 to-orange-500',
        action: () => onNavigate('sales'),
      },
      {
        title: 'Katalog Bahan Baku Siap Olah',
        value: products.length,
        sub: 'Bahan tersedia untuk dipesan',
        icon: Boxes,
        gradient: 'from-violet-600 to-purple-500',
        action: () => onNavigate('products'),
      },
    ];

    return (
      <div className="space-y-6">
        {/* Focused Mitra Welcome & Interactive Onboarding Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-7 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mt-6 -mr-6 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Mitra Resmi Terverifikasi
                </span>
                <span className="text-xs text-blue-200">ID: {currentUser?.username}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Selamat Datang di Portal Mitra, {currentUser?.fullName || 'PIC Restoran'}!
              </h2>
              <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
                Unit Usaha Terdaftar: <strong className="text-white underline decoration-blue-300">{partnerDisplayName}</strong>.
                Kelola kebutuhan restock pasokan bahan makanan olahan & bumbu segar langsung dari Central Kitchen Dapur Pusat.
              </p>
            </div>

            <Button
              size="lg"
              className="bg-white text-blue-800 font-bold shadow-lg shadow-black/10 hover:bg-neutral-100 shrink-0"
              startContent={<Plus className="w-5 h-5 text-blue-600" />}
              onClick={() => onQuickAction('create_so')}
            >
              Pesan Pasokan Restock
            </Button>
          </div>

          {/* Interactive 3-Step Walkthrough Container */}
          <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/40 flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Lihat Katalog Bahan</h4>
                <p className="text-xs text-blue-100 mt-0.5">
                  Cek stok produk makanan olahan, sliced meat, dan saus racikan siap masak.
                </p>
                <button
                  onClick={() => onNavigate('products')}
                  className="text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1 mt-2"
                >
                  Buka Katalog <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/40 flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ajukan Pesanan Restock</h4>
                <p className="text-xs text-blue-100 mt-0.5">
                  Tentukan jumlah pesanan per SKU bahan baku untuk dikirim ke outlet Anda.
                </p>
                <button
                  onClick={() => onNavigate('sales')}
                  className="text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1 mt-2"
                >
                  Daftar Pesanan <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/40 flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Lacak Pengiriman Dingin</h4>
                <p className="text-xs text-blue-100 mt-0.5">
                  Pantau armada cold-storage mulai dari Central Kitchen hingga tiba di cabang Anda.
                </p>
                <span className="text-[11px] font-semibold text-blue-200 block mt-2">
                  Status Real-Time
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mitra Performance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mitraCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Card
                key={i}
                isPressable
                onClick={c.action}
                className="border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900"
              >
                <CardBody className="p-4 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.title}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{c.value}</p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{c.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.gradient} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Mitra Recent Orders Section (Zero-State Tutorial Focus Container) */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    Riwayat Pesanan Pasokan Outlet: {partnerDisplayName}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Daftar seluruh pesanan bahan baku yang diajukan oleh cabang Anda
                  </p>
                </div>
              </div>

              {myOrders.length > 0 && (
                <Button size="sm" variant="flat" color="primary" onClick={() => onNavigate('sales')}>
                  Lihat Semua Pesanan
                </Button>
              )}
            </div>

            {myOrders.length === 0 ? (
              /* Informative Focus / Tutorial Container for New Mitra */
              <div className="my-4 p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center max-w-2xl mx-auto space-y-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shadow-inner">
                  <Store className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Belum Ada Pesanan Pasokan Bahan Baku
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                    Akun kemitraan Anda telah aktif dan siap digunakan. Anda dapat segera mengajukan pesanan restock bahan baku pertama Anda ke Central Kitchen.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button
                    color="primary"
                    size="md"
                    className="font-bold shadow-md shadow-blue-500/20"
                    startContent={<Plus className="w-4 h-4" />}
                    onClick={() => onQuickAction('create_so')}
                  >
                    Ajukan Pesanan Pertama Sekarang
                  </Button>
                  <Button
                    variant="bordered"
                    size="md"
                    startContent={<Package className="w-4 h-4" />}
                    onClick={() => onNavigate('products')}
                  >
                    Jelajahi Katalog Bahan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myOrders.slice(0, 5).map((order) => {
                  const statusColor =
                    order.status === 'DELIVERED' ? 'success' :
                    order.status === 'SHIPPED' ? 'secondary' :
                    order.status === 'CONFIRMED' ? 'primary' : 'warning';

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800/80 hover:border-neutral-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-900 dark:text-white">{order.orderNumber}</span>
                            <Chip size="sm" variant="flat" color={statusColor as any} className="text-[10px] h-4 font-bold">
                              {order.status}
                            </Chip>
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Tanggal Order: {new Date(order.orderDate).toLocaleDateString('id-ID')} • {order.items.length} item bahan
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                          {formatIDR(order.totalAmount)}
                        </p>
                        <p className="text-[11px] text-neutral-400">Tujuan: {order.customerName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // 2. SUPPLIER / VENDOR DASHBOARD VIEW
  // ============================================================================
  if (role === 'SUPPLIER_VENDOR') {
    const myPos = purchaseOrders.filter((po) => {
      if (currentUser?.supplierId && po.supplierId === currentUser.supplierId) return true;
      if (currentUser?.partnerName && po.supplierName && po.supplierName.toLowerCase().includes(currentUser.partnerName.toLowerCase())) return true;
      return false;
    });

    const pendingDelivery = myPos.filter((po) => po.status === 'APPROVED' || po.status === 'SUBMITTED');
    const completedPos = myPos.filter((po) => po.status === 'RECEIVED');
    const totalDelivered = completedPos.reduce((sum, po) => sum + po.totalAmount, 0);

    const vendorCards = [
      {
        title: 'PO Menunggu Pengiriman',
        value: pendingDelivery.length,
        sub: 'Segera siapkan pasokan bahan',
        icon: ShoppingCart,
        gradient: 'from-amber-600 to-orange-500',
        action: () => onNavigate('procurement'),
      },
      {
        title: 'PO Selesai Diterima Gudang',
        value: completedPos.length,
        sub: 'Telah lolos QC & timbangan',
        icon: CheckCircle2,
        gradient: 'from-emerald-600 to-teal-500',
        action: () => onNavigate('procurement'),
      },
      {
        title: 'Nilai Pasokan Terselesaikan',
        value: formatIDR(totalDelivered),
        sub: 'Siap penagihan invoice',
        icon: DollarSign,
        gradient: 'from-blue-600 to-indigo-500',
        action: () => onNavigate('procurement'),
      },
      {
        title: 'Total Purchase Order',
        value: myPos.length,
        sub: 'Histori transaksi vendor',
        icon: FileText,
        gradient: 'from-purple-600 to-indigo-600',
        action: () => onNavigate('procurement'),
      },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 p-7 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Portal Rekanan Supplier
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser?.partnerName || currentUser?.fullName}!
          </h2>
          <p className="text-rose-100 text-sm max-w-xl mt-1">
            Pantau Purchase Order masuk dari tim Procurement Food ERP dan konfirmasi pengiriman bahan mentah Anda ke Cold Storage pusat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendorCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Card
                key={i}
                isPressable
                onClick={c.action}
                className="border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900"
              >
                <CardBody className="p-4 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.title}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{c.value}</p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{c.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.gradient} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================================
  // 3. KITCHEN MANAGER DASHBOARD VIEW
  // ============================================================================
  if (role === 'KITCHEN_MANAGER') {
    const activeWorkOrders = productionOrders.filter((po) => po.status === 'IN_PROGRESS' || po.status === 'PLANNED');
    const lowStockIngredients = stocks.filter((s) => s.isLowStock);

    const kitchenCards = [
      {
        title: 'Work Order Dapur Berjalan',
        value: activeWorkOrders.length,
        sub: 'Batch produksi commissary aktif',
        icon: ChefHat,
        gradient: 'from-amber-600 to-orange-500',
        action: () => onNavigate('production'),
      },
      {
        title: 'Resep Standar (BOM)',
        value: recipes.length,
        sub: 'Formula resep baku dapur pusat',
        icon: Layers,
        gradient: 'from-blue-600 to-indigo-500',
        action: () => onNavigate('production'),
      },
      {
        title: 'Bahan Baku Kritis (Low Stock)',
        value: lowStockIngredients.length,
        sub: 'Butuh pasokan untuk masak',
        icon: AlertTriangle,
        gradient: 'from-rose-600 to-red-500',
        action: () => onNavigate('inventory'),
      },
      {
        title: 'Katalog Bahan & Olahan',
        value: products.length,
        sub: 'Total SKU olahan siap saji',
        icon: Package,
        gradient: 'from-emerald-600 to-teal-500',
        action: () => onNavigate('products'),
      },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-amber-700 via-orange-700 to-rose-700 p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Central Kitchen Operations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Central Commissary Kitchen
            </h2>
            <p className="text-amber-100 text-sm max-w-xl mt-1">
              Manajemen formula resep BOM, penerbitan work order batch produksi olahan daging, dan konversi bahan baku.
            </p>
          </div>
          <Button
            size="md"
            className="bg-white text-orange-800 font-bold shadow-md hover:bg-neutral-100"
            startContent={<Plus className="w-4 h-4" />}
            onClick={() => onNavigate('production')}
          >
            Terbitkan Work Order
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kitchenCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Card
                key={i}
                isPressable
                onClick={c.action}
                className="border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900"
              >
                <CardBody className="p-4 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.title}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{c.value}</p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{c.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.gradient} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================================
  // 4. WAREHOUSE & LOGISTICS DASHBOARD VIEW
  // ============================================================================
  if (role === 'WAREHOUSE_LOGISTICS') {
    const lowStockCount = stocks.filter((s) => s.isLowStock).length;

    const warehouseCards = [
      {
        title: 'Alert Stok Menipis',
        value: lowStockCount,
        sub: 'Segera lakukan opname / order',
        icon: AlertTriangle,
        gradient: 'from-amber-500 to-orange-500',
        action: () => onNavigate('inventory'),
      },
      {
        title: 'Gudang & Cold Storage Aktif',
        value: warehouses.length,
        sub: 'Lokasi penyimpanan & zona suhu',
        icon: WarehouseIcon,
        gradient: 'from-blue-600 to-cyan-500',
        action: () => onNavigate('warehouses'),
      },
      {
        title: 'Total SKU Bahan Tersimpan',
        value: stocks.length,
        sub: 'Live bin balances',
        icon: Boxes,
        gradient: 'from-emerald-600 to-teal-500',
        action: () => onNavigate('inventory'),
      },
      {
        title: 'Audit Mutasi Stok',
        value: metrics?.recentTransactions?.length || 0,
        sub: 'Log keluar / masuk terverifikasi',
        icon: History,
        gradient: 'from-purple-600 to-indigo-500',
        action: () => onNavigate('transactions'),
      },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-blue-800 via-cyan-800 to-teal-800 p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Logistics & Cold Storage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Gudang & Logistik Rantai Dingin
            </h2>
            <p className="text-cyan-100 text-sm max-w-xl mt-1">
              Kontrol stok fisik bahan baku, penerimaan barang dari vendor (Goods Receipt), dan pemindahan antar gudang.
            </p>
          </div>
          <Button
            size="md"
            className="bg-white text-teal-800 font-bold shadow-md hover:bg-neutral-100"
            startContent={<Boxes className="w-4 h-4" />}
            onClick={() => onQuickAction('receive_goods')}
          >
            Terima Barang (GRN)
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {warehouseCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Card
                key={i}
                isPressable
                onClick={c.action}
                className="border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900"
              >
                <CardBody className="p-4 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.title}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{c.value}</p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{c.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.gradient} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================================
  // 5. PROCUREMENT OFFICER DASHBOARD VIEW
  // ============================================================================
  if (role === 'PROCUREMENT_OFFICER') {
    const activePos = purchaseOrders.filter((po) => po.status === 'SUBMITTED' || po.status === 'APPROVED');
    const lowStockItems = stocks.filter((s) => s.isLowStock);

    const procurementCards = [
      {
        title: 'PO Pengadaan Berjalan',
        value: activePos.length,
        sub: 'Menunggu pengiriman vendor',
        icon: ShoppingCart,
        gradient: 'from-purple-600 to-indigo-500',
        action: () => onNavigate('procurement'),
      },
      {
        title: 'Item Butuh Reorder (Stok Rendah)',
        value: lowStockItems.length,
        sub: 'Segera terbitkan PO baru',
        icon: AlertTriangle,
        gradient: 'from-amber-500 to-orange-500',
        action: () => onNavigate('inventory'),
      },
      {
        title: 'Katalog Bahan Baku Pasokan',
        value: products.length,
        sub: 'Daging, seafood, bumbu & sayur',
        icon: Package,
        gradient: 'from-blue-600 to-cyan-500',
        action: () => onNavigate('products'),
      },
      {
        title: 'Audit Masuk Bahan Baku',
        value: metrics?.recentTransactions?.length || 0,
        sub: 'Log penerimaan gudang',
        icon: History,
        gradient: 'from-emerald-600 to-teal-500',
        action: () => onNavigate('transactions'),
      },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-800 p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Procurement & Vendor Supply
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Pengadaan & Pembelian Bahan Baku
            </h2>
            <p className="text-purple-100 text-sm max-w-xl mt-1">
              Penerbitan Purchase Order (PO) ke vendor rekanan, pengawasan harga beli, dan jadwal pasokan masuk.
            </p>
          </div>
          <Button
            size="md"
            className="bg-white text-purple-800 font-bold shadow-md hover:bg-neutral-100"
            startContent={<Plus className="w-4 h-4" />}
            onClick={() => onQuickAction('create_po')}
          >
            Buat Purchase Order
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {procurementCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Card
                key={i}
                isPressable
                onClick={c.action}
                className="border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900"
              >
                <CardBody className="p-4 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.title}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{c.value}</p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{c.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.gradient} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================================
  // 6. SUPERADMIN EXECUTIVE DASHBOARD VIEW
  // ============================================================================
  const statCards = [
    {
      title: 'Total Produk & Bahan',
      value: metrics?.totalProducts ?? 0,
      sub: `${metrics?.totalWarehouses ?? 0} Gudang Aktif`,
      icon: Package,
      gradient: 'from-blue-600 to-cyan-500',
      action: () => onNavigate('products'),
    },
    {
      title: 'Alert Stok Menipis',
      value: metrics?.lowStockCount ?? 0,
      sub: 'Perlu reorder segera',
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      action: () => onNavigate('inventory'),
      isAlert: (metrics?.lowStockCount ?? 0) > 0,
    },
    {
      title: 'PO Pengadaan Aktif',
      value: metrics?.activePurchaseOrders ?? 0,
      sub: 'Dalam proses procurement',
      icon: ShoppingCart,
      gradient: 'from-purple-600 to-indigo-500',
      action: () => onNavigate('procurement'),
    },
    {
      title: 'Estimasi Valuasi Stok',
      value: formatIDR(metrics?.totalStockValuation),
      sub: 'Total modal barang gudang',
      icon: DollarSign,
      gradient: 'from-emerald-600 to-teal-500',
      action: () => onNavigate('inventory'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card
              key={i}
              isPressable
              onClick={c.action}
              className="border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900"
            >
              <CardBody className="p-4 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.title}</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{c.value}</p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{c.sub}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.gradient} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout: Low Stock Warning + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warning Card */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Low Stock Items</h3>
                  <p className="text-xs text-neutral-500">Items at or below safe reorder thresholds</p>
                </div>
              </div>
              <Button size="sm" variant="flat" color="warning" onClick={() => onNavigate('inventory')}>
                View All
              </Button>
            </div>

            {(!metrics?.lowStockAlerts || metrics.lowStockAlerts.length === 0) ? (
              <div className="py-8 text-center text-neutral-400 text-sm">
                No low stock alerts right now. Inventory is well-stocked!
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.lowStockAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white">{item.productName}</span>
                        <Chip size="sm" variant="flat" color="danger" className="text-[10px] h-4">
                          {item.productCode}
                        </Chip>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {item.warehouseName} • Min: {item.minStock} {item.unit}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {item.quantity} {item.unit}
                      </p>
                      <button
                        onClick={() => onQuickAction('create_po')}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        + Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Purchase Orders Card */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Recent Purchase Orders</h3>
                  <p className="text-xs text-neutral-500">Inbound procurement from food suppliers</p>
                </div>
              </div>
              <Button size="sm" variant="flat" color="primary" onClick={() => onNavigate('procurement')}>
                View All
              </Button>
            </div>

            {(!metrics?.recentPurchaseOrders || metrics.recentPurchaseOrders.length === 0) ? (
              <div className="py-8 text-center text-neutral-400 text-sm">
                No purchase orders created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recentPurchaseOrders.map((po) => {
                  const statusColor = 
                    po.status === 'RECEIVED' ? 'success' :
                    po.status === 'APPROVED' ? 'primary' :
                    po.status === 'SUBMITTED' ? 'warning' : 'default';

                  return (
                    <div
                      key={po.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-neutral-900 dark:text-white">{po.orderNumber}</span>
                          <Chip size="sm" variant="flat" color={statusColor as any} className="text-[10px] h-4 font-bold">
                            {po.status}
                          </Chip>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {po.supplierName} • {new Date(po.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {formatIDR(po.totalAmount)}
                        </p>
                        <p className="text-[10px] text-neutral-400">{po.items?.length ?? 0} item(s)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Stock Movement Audit Stream */}
      <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <CardBody className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Recent Inventory Stock Movements</h3>
              <p className="text-xs text-neutral-500">Live auditable inventory ledger</p>
            </div>
            <Button size="sm" variant="light" onClick={() => onNavigate('transactions')}>
              Full Audit Trail
            </Button>
          </div>

          {(!metrics?.recentTransactions || metrics.recentTransactions.length === 0) ? (
            <div className="py-8 text-center text-neutral-400 text-sm">
              No stock movements recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Warehouse</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Ref</th>
                    <th className="pb-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {metrics.recentTransactions.map((tx) => {
                    const isInbound = tx.transactionType === 'IN_PURCHASE' || tx.transactionType === 'ADJUSTMENT';
                    return (
                      <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 font-semibold">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={isInbound ? 'success' : 'primary'}
                            className="text-[10px] h-5"
                          >
                            {tx.transactionType}
                          </Chip>
                        </td>
                        <td className="py-3 font-medium text-neutral-900 dark:text-white">{tx.productName}</td>
                        <td className="py-3 text-neutral-500">{tx.warehouseName}</td>
                        <td className={`py-3 font-bold ${isInbound ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {isInbound ? '+' : '-'}{tx.quantity}
                        </td>
                        <td className="py-3 text-neutral-400 font-mono text-[11px]">{tx.referenceNumber || '-'}</td>
                        <td className="py-3 text-right text-neutral-400">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
