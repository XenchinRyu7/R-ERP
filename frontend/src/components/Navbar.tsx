import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  RefreshCw,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Building,
  Building2,
  CheckCircle2,
  Sliders,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import {
  Button,
  Avatar,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Switch
} from '@heroui/react';
import { AuthUser, UserRole } from '../types/erp';
import { ActivePage } from './Sidebar';

interface NavbarProps {
  title: string;
  subtitle: string;
  isDark: boolean;
  toggleTheme: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  isDark,
  toggleTheme,
  onRefresh,
  isLoading = false,
  currentUser,
  onLogout,
  onNavigate,
}) => {
  // Modal controllers
  const {
    isOpen: isProfileOpen,
    onOpen: onOpenProfile,
    onClose: onCloseProfile,
  } = useDisclosure();

  const {
    isOpen: isSettingsOpen,
    onOpen: onOpenSettings,
    onClose: onCloseSettings,
  } = useDisclosure();

  // Settings states
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

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

  const handleDropdownAction = (key: React.Key) => {
    switch (key) {
      case 'profile':
        onOpenProfile();
        break;
      case 'settings':
        onOpenSettings();
        break;
      case 'users_page':
        if (onNavigate) onNavigate('users');
        break;
      case 'theme_toggle':
        toggleTheme();
        break;
      case 'logout':
        if (onLogout) onLogout();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">{title}</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={onRefresh}
              isLoading={isLoading}
              title="Refresh Data"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </Button>

          <Badge content="3" color="danger" size="sm" shape="circle">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              title="Notifications"
              className="text-neutral-600 dark:text-neutral-400"
            >
              <Bell className="w-4 h-4" />
            </Button>
          </Badge>

          <div className="h-6 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1" />

          {/* User Profile Dropdown Menu */}
          <Dropdown placement="bottom-end" backdrop="blur">
            <DropdownTrigger>
              <button
                className="flex items-center gap-2.5 p-1.5 -mr-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none"
                aria-label="User profile menu"
              >
                <Avatar
                  name={currentUser?.fullName || currentUser?.username || 'Admin'}
                  size="sm"
                  className="bg-blue-600 text-white font-bold ring-2 ring-blue-500/20"
                />
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 max-w-[130px] truncate">
                      {currentUser?.fullName || currentUser?.username || 'Super Administrator'}
                    </p>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <p className="text-[10px] text-neutral-400 max-w-[130px] truncate">
                    {currentUser?.email || 'admin@fooderp.com'}
                  </p>
                </div>
              </button>
            </DropdownTrigger>

            <DropdownMenu
              aria-label="User Actions"
              variant="flat"
              onAction={handleDropdownAction}
              className="w-72"
            >
              <DropdownSection showDivider>
                <DropdownItem key="user_info" isReadOnly className="h-16 gap-2 opacity-100 cursor-default">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {currentUser?.fullName || currentUser?.username || 'Super Administrator'}
                      </p>
                      <Chip
                        size="sm"
                        color={roleInfo.color}
                        variant="flat"
                        className="text-[10px] h-5 px-1.5 font-bold"
                      >
                        {roleInfo.label}
                      </Chip>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {currentUser?.email || 'admin@fooderp.com'}
                    </p>
                    {currentUser?.partnerName && (
                      <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 truncate mt-1 flex items-center gap-1">
                        <Building className="w-3 h-3 shrink-0" />
                        <span>{currentUser.partnerName}</span>
                      </p>
                    )}
                    {currentUser?.warehouseName && (
                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>Fasilitas: {currentUser.warehouseName}</span>
                      </p>
                    )}
                  </div>
                </DropdownItem>
              </DropdownSection>

              <DropdownSection title="Akun & Preferensi" showDivider>
                <DropdownItem
                  key="profile"
                  startContent={<User className="w-4 h-4 text-neutral-500" />}
                  description="Informasi akun, kontak & peran"
                >
                  Profil Pengguna
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<Settings className="w-4 h-4 text-neutral-500" />}
                  description="Preferensi tampilan & sistem"
                >
                  Pengaturan Sistem
                </DropdownItem>
              </DropdownSection>

              <DropdownSection>
                <DropdownItem
                  key="logout"
                  color="danger"
                  className="text-danger"
                  startContent={<LogOut className="w-4 h-4" />}
                  description="Akhiri sesi login saat ini"
                >
                  Keluar (Sign Out)
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>

      {/* 1. Modal Profil Pengguna */}
      <Modal isOpen={isProfileOpen} onClose={onCloseProfile} size="md">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Profil Pengguna</h3>
              <p className="text-xs text-neutral-500 font-normal">Informasi identitas akun dan hak akses Anda</p>
            </div>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <Avatar
                name={currentUser?.fullName || currentUser?.username || 'Admin'}
                size="md"
                className="bg-blue-600 text-white font-bold ring-2 ring-blue-500/30"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-neutral-900 dark:text-white">
                  {currentUser?.fullName || currentUser?.username}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">@{currentUser?.username}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Chip size="sm" color={roleInfo.color} variant="flat" className="h-5 text-[10px] font-bold">
                    {roleInfo.label}
                  </Chip>
                  <Chip size="sm" color="success" variant="dot" className="h-5 text-[10px] font-semibold border-none">
                    {currentUser?.status || 'ACTIVE'}
                  </Chip>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Email:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{currentUser?.email || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Nomor Telepon:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{currentUser?.phone || '-'}</span>
              </div>
              {currentUser?.partnerName && (
                <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Unit Usaha / Mitra:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{currentUser.partnerName}</span>
                </div>
              )}
              {currentUser?.customerName && (
                <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Cabang Restoran:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{currentUser.customerName}</span>
                </div>
              )}
              {currentUser?.supplierName && (
                <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Rekanan Supplier:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{currentUser.supplierName}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Kantor / Lokasi Tugas:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {currentUser?.warehouseName ? `${currentUser.warehouseName} (${currentUser.warehouseCode || ''})` : 'Kantor Pusat / Semua Fasilitas (HQ)'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-500">Status Akun:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terverifikasi & Aktif
                </span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="light" onClick={onCloseProfile}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 2. Modal Pengaturan Sistem */}
      <Modal isOpen={isSettingsOpen} onClose={onCloseSettings} size="md">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Pengaturan Sistem</h3>
              <p className="text-xs text-neutral-500 font-normal">Kustomisasi antarmuka dan preferensi kerja ERP</p>
            </div>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Mode Gelap (Dark Mode)</p>
                  <p className="text-[11px] text-neutral-400">Gunakan tema kontras tinggi yang nyaman di mata</p>
                </div>
                <Switch isSelected={isDark} onValueChange={toggleTheme} size="sm" color="primary" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Auto-Refresh Sinkronisasi</p>
                  <p className="text-[11px] text-neutral-400">Perbarui data stok dan pesanan secara berkala</p>
                </div>
                <Switch isSelected={autoRefresh} onValueChange={setAutoRefresh} size="sm" color="primary" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Peringatan Suara Notifikasi</p>
                  <p className="text-[11px] text-neutral-400">Bunyikan nada saat ada alert stok menipis</p>
                </div>
                <Switch isSelected={soundAlerts} onValueChange={setSoundAlerts} size="sm" color="primary" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Tampilan Tabel Kompak</p>
                  <p className="text-[11px] text-neutral-400">Persempit padding baris agar memuat lebih banyak item</p>
                </div>
                <Switch isSelected={compactMode} onValueChange={setCompactMode} size="sm" color="primary" />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" color="primary" onClick={onCloseSettings}>
              Simpan Pengaturan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
