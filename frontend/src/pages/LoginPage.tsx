import React, { useState } from 'react';
import {
  Truck,
  Lock,
  User,
  Building,
  Mail,
  Phone,
  Store,
  ChefHat,
  Boxes,
  ShoppingCart,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Select,
  SelectItem,
  Textarea
} from '@heroui/react';
import { erpApi } from '../api/erpApi';
import { AuthUser, UserRole } from '../types/erp';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedTab, setSelectedTab] = useState<string>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');

  // Mitra registration form
  const [regRole, setRegRole] = useState<'MITRA_OUTLET' | 'SUPPLIER_VENDOR'>('MITRA_OUTLET');
  const [regPartnerName, setRegPartnerName] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNotes, setRegNotes] = useState('');

  const demoAccounts = [
    { label: 'Superadmin', username: 'admin', pass: 'admin123', role: 'SUPERADMIN', color: 'primary' as const, icon: Users },
    { label: 'Chef Kitchen', username: 'chef.juna', pass: 'kitchen123', role: 'KITCHEN_MANAGER', color: 'warning' as const, icon: ChefHat },
    { label: 'Logistics', username: 'warehouse.budi', pass: 'warehouse123', role: 'WAREHOUSE_LOGISTICS', color: 'secondary' as const, icon: Boxes },
    { label: 'Purchasing', username: 'procure.siti', pass: 'procure123', role: 'PROCUREMENT_OFFICER', color: 'default' as const, icon: ShoppingCart },
    { label: 'Mitra Outlet', username: 'mitra.senopati', pass: 'mitra123', role: 'MITRA_OUTLET', color: 'success' as const, icon: Store },
    { label: 'Vendor Mitra', username: 'vendor.boga', pass: 'vendor123', role: 'SUPPLIER_VENDOR', color: 'danger' as const, icon: Truck },
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setLoginIdentifier(acc.username);
    setLoginPassword(acc.pass);
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setErrorMsg('Harap masukkan username/email dan password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await erpApi.login({
        usernameOrEmail: loginIdentifier,
        password: loginPassword,
      });
      localStorage.setItem('food_erp_token', res.token);
      localStorage.setItem('food_erp_user', JSON.stringify(res.user));
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterMitra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPartnerName || !regFullName || !regEmail || !regUsername || !regPassword) {
      setErrorMsg('Harap lengkapi semua kolom wajib.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await erpApi.registerMitra({
        role: regRole,
        partnerName: regPartnerName,
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        username: regUsername,
        password: regPassword,
        notes: regNotes,
      });
      setSuccessMsg('Pendaftaran mitra berhasil diajukan! Akun Anda sedang menunggu approval Superadmin.');
      // Reset form
      setRegPartnerName('');
      setRegFullName('');
      setRegEmail('');
      setRegPhone('');
      setRegUsername('');
      setRegPassword('');
      setRegNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral-100 via-neutral-50 to-blue-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Food ERP Portal
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Enterprise Restaurant Supply Chain, Central Kitchen & Partner Portal
          </p>
        </div>

        {/* Tabs: Login vs Register Mitra */}
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(k) => {
            setSelectedTab(k as string);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          fullWidth
          radius="lg"
          color="primary"
          variant="solid"
        >
          <Tab key="login" title="Masuk (Login)" />
          <Tab key="register" title="Daftar Mitra / Outlet" />
        </Tabs>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {selectedTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Username atau Email"
              placeholder="admin atau email@fooderp.com"
              value={loginIdentifier}
              onValueChange={setLoginIdentifier}
              startContent={<User className="w-4 h-4 text-neutral-400" />}
              isRequired
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={loginPassword}
              onValueChange={setLoginPassword}
              startContent={<Lock className="w-4 h-4 text-neutral-400" />}
              isRequired
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-bold shadow-md shadow-blue-600/20"
              isLoading={isLoading}
            >
              Masuk ke Dashboard
            </Button>

            {/* Quick Demo Selector */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2 text-center">
                Demo Quick-Login (Pilih Role):
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {demoAccounts.map((acc) => (
                  <Button
                    key={acc.username}
                    size="sm"
                    variant="flat"
                    color={acc.color}
                    onPress={() => handleSelectDemo(acc)}
                    className="text-[11px] font-semibold h-7 px-2.5 rounded-lg"
                  >
                    {acc.label}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: MITRA SELF REGISTRATION */}
        {selectedTab === 'register' && (
          <form onSubmit={handleRegisterMitra} className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-800 dark:text-blue-300">
              Pendaftaran kemitraan baru (Restoran Cabang / Franchise / Vendor) memerlukan verifikasi & approval dari Superadmin sebelum dapat login.
            </div>

            <Select
              label="Kategori Kemitraan"
              selectedKeys={[regRole]}
              onChange={(e) => setRegRole(e.target.value as any)}
              isRequired
            >
              <SelectItem key="MITRA_OUTLET">
                Mitra Cabang Restoran / Franchisee (Pemesanan Bahan Baku)
              </SelectItem>
              <SelectItem key="SUPPLIER_VENDOR">
                Vendor Mitra / Supplier (Penyedia Pasokan Mentah)
              </SelectItem>
            </Select>

            <Input
              label="Nama Usaha / Nama Outlet Restoran"
              placeholder="contoh: Tokyo Dining Senopati atau CV Hasil Samudera"
              value={regPartnerName}
              onValueChange={setRegPartnerName}
              startContent={<Building className="w-4 h-4 text-neutral-400" />}
              isRequired
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nama Penanggung Jawab (PIC)"
                placeholder="Nama Lengkap"
                value={regFullName}
                onValueChange={setRegFullName}
                isRequired
              />
              <Input
                label="Nomor WhatsApp / HP"
                placeholder="+62 812..."
                value={regPhone}
                onValueChange={setRegPhone}
                startContent={<Phone className="w-4 h-4 text-neutral-400" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="email"
                label="Email Bisnis"
                placeholder="pic@outlet.id"
                value={regEmail}
                onValueChange={setRegEmail}
                startContent={<Mail className="w-4 h-4 text-neutral-400" />}
                isRequired
              />
              <Input
                label="Username Login"
                placeholder="mitra.senopati"
                value={regUsername}
                onValueChange={setRegUsername}
                isRequired
              />
            </div>

            <Input
              type="password"
              label="Password"
              placeholder="Minimal 6 karakter"
              value={regPassword}
              onValueChange={setRegPassword}
              startContent={<Lock className="w-4 h-4 text-neutral-400" />}
              isRequired
            />

            <Textarea
              label="Catatan Pengajuan / Keterangan Kemitraan"
              placeholder="e.g. Lokasi cabang di Senopati, membutuhkan supply harian daging & sayur..."
              value={regNotes}
              onValueChange={setRegNotes}
              rows={2}
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-bold shadow-md shadow-blue-600/20"
              isLoading={isLoading}
            >
              Ajukan Pendaftaran Kemitraan
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
