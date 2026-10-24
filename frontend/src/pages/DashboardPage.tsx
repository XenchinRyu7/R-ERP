import React from 'react';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  Truck,
  Plus
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
import { DashboardMetrics } from '../types/erp';
import { ActivePage } from '../components/Sidebar';

interface DashboardPageProps {
  metrics: DashboardMetrics | null;
  onNavigate: (page: ActivePage) => void;
  onQuickAction: (action: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  onNavigate,
  onQuickAction,
}) => {
  const formatIDR = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const statCards = [
    {
      title: 'Total Products',
      value: metrics?.totalProducts ?? 0,
      sub: `${metrics?.totalWarehouses ?? 0} Active Warehouses`,
      icon: Package,
      gradient: 'from-blue-600 to-cyan-500',
      action: () => onNavigate('products'),
    },
    {
      title: 'Low Stock Alerts',
      value: metrics?.lowStockCount ?? 0,
      sub: 'Needs immediate replenishment',
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      action: () => onNavigate('inventory'),
      isAlert: (metrics?.lowStockCount ?? 0) > 0,
    },
    {
      title: 'Active Purchase Orders',
      value: metrics?.activePurchaseOrders ?? 0,
      sub: 'In procurement / receiving',
      icon: ShoppingCart,
      gradient: 'from-purple-600 to-indigo-500',
      action: () => onNavigate('procurement'),
    },
    {
      title: 'Inventory Valuation',
      value: formatIDR(metrics?.totalStockValuation),
      sub: 'Estimated cost on hand',
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

          <div className="overflow-x-auto">
            <Table aria-label="Recent transactions table" shadow="none" className="p-0">
              <TableHeader>
                <TableColumn>TIME</TableColumn>
                <TableColumn>PRODUCT</TableColumn>
                <TableColumn>WAREHOUSE</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>QUANTITY</TableColumn>
                <TableColumn>REFERENCE</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No stock movement recorded yet.">
                {(metrics?.recentTransactions ?? []).map((tx) => {
                  const isPositive = Number(tx.quantity) > 0;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-neutral-500">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">{tx.productName}</span>
                        <span className="text-[10px] text-neutral-400 block">{tx.productCode}</span>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-600 dark:text-neutral-400">{tx.warehouseName}</TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={tx.transactionType === 'IN_PURCHASE' ? 'success' : tx.transactionType === 'OUT_SALES' ? 'primary' : 'warning'}
                          className="text-[10px] h-5 font-semibold"
                        >
                          {tx.transactionType}
                        </Chip>
                      </TableCell>
                      <TableCell className="font-bold text-xs">
                        <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                          {isPositive ? `+${tx.quantity}` : tx.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500 font-mono">{tx.referenceNumber || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
