import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  Building2,
  ShoppingCart,
  Boxes,
  Truck,
  History,
  Store,
  ChevronRight,
  ChefHat,
  ShieldCheck,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Chip, Button } from '@heroui/react';
import { AuthUser, UserRole } from '../types/erp';

export type ActivePage = 
  | 'dashboard' 
  | 'users'
  | 'products' 
  | 'categories' 
  | 'partners' 
  | 'warehouses' 
  | 'procurement' 
  | 'inventory' 
  | 'production'
  | 'sales' 
  | 'transactions';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  pendingApprovalsCount?: number;
  lowStockCount?: number;
  activePoCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  currentUser,
  onLogout,
  pendingApprovalsCount = 0,
  lowStockCount = 0,
  activePoCount = 0,
}) => {
  const role: UserRole = currentUser?.role || 'SUPERADMIN';

  // Role permissions checker
  const canAccess = (page: ActivePage): boolean => {
    switch (role) {
      case 'SUPERADMIN':
        return true;
      case 'KITCHEN_MANAGER':
        return ['dashboard', 'production', 'inventory', 'products', 'transactions'].includes(page);
      case 'WAREHOUSE_LOGISTICS':
        return ['dashboard', 'inventory', 'warehouses', 'products', 'transactions'].includes(page);
      case 'PROCUREMENT_OFFICER':
        return ['dashboard', 'procurement', 'partners', 'products', 'inventory', 'transactions'].includes(page);
      case 'MITRA_OUTLET':
        return ['dashboard', 'sales', 'products'].includes(page);
      case 'SUPPLIER_VENDOR':
        return ['dashboard', 'procurement'].includes(page);
      default:
        return false;
    }
  };

  const rawMenuGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
        ...(role === 'SUPERADMIN' ? [
          {
            id: 'users' as ActivePage,
            label: 'Users & Mitra Approvals',
            icon: ShieldCheck,
            badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : undefined,
            badgeColor: 'warning' as const,
          }
        ] : []),
      ],
    },
    {
      group: 'MASTER DATA',
      items: [
        { id: 'products' as ActivePage, label: 'Product Catalog', icon: Package },
        { id: 'categories' as ActivePage, label: 'Categories', icon: Layers },
        { id: 'partners' as ActivePage, label: 'Suppliers & Clients', icon: Users },
        { id: 'warehouses' as ActivePage, label: 'Warehouses', icon: Building2 },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        {
          id: 'procurement' as ActivePage,
          label: role === 'SUPPLIER_VENDOR' ? 'Vendor Purchase Orders' : 'Procurement (PO)',
          icon: ShoppingCart,
          badge: activePoCount > 0 ? `${activePoCount}` : undefined,
          badgeColor: 'primary' as const,
        },
        {
          id: 'inventory' as ActivePage,
          label: 'Inventory & Stock',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined,
          badgeColor: 'danger' as const,
        },
        { id: 'production' as ActivePage, label: 'Central Kitchen (BOM)', icon: ChefHat },
        {
          id: 'sales' as ActivePage,
          label: role === 'MITRA_OUTLET' ? 'Outlet Restock Orders' : 'Branch Orders (SO)',
          icon: Store,
        },
        { id: 'transactions' as ActivePage, label: 'Stock Movement Log', icon: History },
      ],
    },
  ];

  // Filter groups and items according to role permissions
  const menuGroups = rawMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(item.id)),
    }))
    .filter((group) => group.items.length > 0);

  const getRoleBadge = (userRole?: UserRole) => {
    switch (userRole) {
      case 'SUPERADMIN':
        return { label: 'Super Admin', color: 'primary' as const };
      case 'KITCHEN_MANAGER':
        return { label: 'Head Chef / Kitchen', color: 'warning' as const };
      case 'WAREHOUSE_LOGISTICS':
        return { label: 'Logistics / Warehouse', color: 'secondary' as const };
      case 'PROCUREMENT_OFFICER':
        return { label: 'Procurement Officer', color: 'default' as const };
      case 'MITRA_OUTLET':
        return { label: 'Mitra Outlet', color: 'success' as const };
      case 'SUPPLIER_VENDOR':
        return { label: 'Supplier Vendor', color: 'danger' as const };
      default:
        return { label: 'User', color: 'default' as const };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-neutral-200 dark:border-neutral-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
            Food ERP
            <span className="text-[10px] font-semibold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Enterprise Food Supply</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[11px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase mb-2">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <Chip
                        size="sm"
                        variant="flat"
                        color={isActive ? 'default' : item.badgeColor}
                        className="text-[10px] h-5 px-1.5 font-bold"
                      >
                        {item.badge}
                      </Chip>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout Footer */}
      {currentUser && (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {currentUser.fullName || currentUser.username}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Chip
                    size="sm"
                    color={roleInfo.color}
                    variant="flat"
                    className="h-4 text-[9px] px-1 font-semibold"
                  >
                    {roleInfo.label}
                  </Chip>
                </div>
              </div>
            </div>

            {onLogout && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                className="shrink-0 text-neutral-400 hover:text-red-600"
                onClick={onLogout}
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
