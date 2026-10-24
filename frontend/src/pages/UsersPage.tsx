import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building,
  Store,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Input,
  Textarea
} from '@heroui/react';
import { AuthUser, Customer, Supplier, UserRole, UserStatus } from '../types/erp';
import { erpApi } from '../api/erpApi';

interface UsersPageProps {
  users: AuthUser[];
  customers: Customer[];
  suppliers: Supplier[];
  onRefresh: () => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({
  users,
  customers,
  suppliers,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected user for approval
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

  // Modals
  const {
    isOpen: isCreateStaffOpen,
    onOpen: onOpenCreateStaff,
    onOpenChange: onOpenChangeCreateStaff,
    onClose: onCloseCreateStaff,
  } = useDisclosure();

  const {
    isOpen: isApproveOpen,
    onOpen: onOpenApprove,
    onOpenChange: onOpenChangeApprove,
    onClose: onCloseApprove,
  } = useDisclosure();

  // Create Staff Form
  const [staffUsername, setStaffUsername] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffFullName, setStaffFullName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('KITCHEN_MANAGER');

  // Approve Mitra Form
  const [approvalAction, setApprovalAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.partnerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'primary';
      case 'KITCHEN_MANAGER':
        return 'warning';
      case 'WAREHOUSE_LOGISTICS':
        return 'secondary';
      case 'PROCUREMENT_OFFICER':
        return 'default';
      case 'MITRA_OUTLET':
        return 'success';
      case 'SUPPLIER_VENDOR':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING_APPROVAL':
        return 'warning';
      case 'REJECTED':
      case 'INACTIVE':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleOpenApprove = (user: AuthUser) => {
    setSelectedUser(user);
    setApprovalAction('APPROVE');
    setApprovalNotes('');
    if (user.role === 'MITRA_OUTLET') {
      setSelectedCustomerId(customers[0]?.id || '');
      setSelectedSupplierId('');
    } else {
      setSelectedCustomerId('');
      setSelectedSupplierId(suppliers[0]?.id || '');
    }
    onOpenApprove();
  };

  const handleSubmitApprove = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await erpApi.approveMitra(selectedUser.id, {
        action: approvalAction,
        customerId: approvalAction === 'APPROVE' && selectedCustomerId ? selectedCustomerId : undefined,
        supplierId: approvalAction === 'APPROVE' && selectedSupplierId ? selectedSupplierId : undefined,
        approvalNotes: approvalNotes,
      });
      onCloseApprove();
      onRefresh();
    } catch (err: any) {
      alert(`Error updating approval: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCreateStaff = async () => {
    if (!staffUsername || !staffEmail || !staffPassword || !staffFullName) {
      alert('Harap lengkapi semua data wajib staf.');
      return;
    }
    setIsSubmitting(true);
    try {
      await erpApi.createStaff({
        username: staffUsername,
        email: staffEmail,
        password: staffPassword,
        fullName: staffFullName,
        phone: staffPhone,
        role: staffRole,
      });
      onCloseCreateStaff();
      onRefresh();
      // Reset
      setStaffUsername('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffFullName('');
      setStaffPhone('');
    } catch (err: any) {
      alert(`Gagal membuat staf: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Ubah status pengguna ${user.username} menjadi ${newStatus}?`)) return;
    try {
      await erpApi.updateUserStatus(user.id, newStatus);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const pendingCount = users.filter((u) => u.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Terdaftar</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">{users.length}</p>
          <span className="text-xs text-neutral-400 mt-1 block">Seluruh akun staf & mitra</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Menunggu Approval</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{pendingCount}</p>
          <span className="text-xs text-neutral-400 mt-1 block">Pengajuan mitra baru</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Staf Internal</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
            {users.filter((u) => u.role !== 'MITRA_OUTLET' && u.role !== 'SUPPLIER_VENDOR').length}
          </p>
          <span className="text-xs text-neutral-400 mt-1 block">Admin, Dapur, Gudang & Pembelian</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mitra Aktif</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
            {users.filter((u) => (u.role === 'MITRA_OUTLET' || u.role === 'SUPPLIER_VENDOR') && u.status === 'ACTIVE').length}
          </p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Outlet Restoran & Vendor Terverifikasi</span>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED'].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? 'solid' : 'flat'}
              color={statusFilter === st ? 'primary' : 'default'}
              onPress={() => setStatusFilter(st)}
              className="text-xs font-semibold rounded-xl shrink-0"
            >
              {st.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            size="sm"
            placeholder="Cari user, nama mitra, email..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="w-full sm:w-64"
          />

          <Button
            color="primary"
            size="sm"
            startContent={<UserPlus className="w-4 h-4" />}
            onPress={onOpenCreateStaff}
            className="font-semibold shadow-sm shrink-0"
          >
            Tambah Staf Internal
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
        <Table aria-label="Tabel Pengguna & Mitra" removeWrapper>
          <TableHeader>
            <TableColumn>PENGGUNA / PIC</TableColumn>
            <TableColumn>ROLE & HAK AKSES</TableColumn>
            <TableColumn>TIPE MITRA / NAMA USAHA</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>TANGGAL DAFTAR</TableColumn>
            <TableColumn align="center">AKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Tidak ada pengguna yang sesuai dengan filter.">
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <TableCell>
                  <div className="font-semibold text-neutral-900 dark:text-white">{user.fullName}</div>
                  <div className="text-xs text-neutral-400">@{user.username} • {user.email}</div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color={getRoleBadgeColor(user.role)} className="font-bold text-xs uppercase">
                    {user.role.replace('_', ' ')}
                  </Chip>
                </TableCell>
                <TableCell>
                  {user.partnerName ? (
                    <div>
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                        {user.partnerName}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {user.customerName ? `Linked: ${user.customerName}` : user.supplierName ? `Linked: ${user.supplierName}` : 'Belum ditautkan'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400 italic">Internal Staff</span>
                  )}
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color={getStatusBadgeColor(user.status)} className="font-bold text-xs uppercase">
                    {user.status.replace('_', ' ')}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-neutral-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1.5">
                    {user.status === 'PENDING_APPROVAL' && (
                      <Button
                        size="sm"
                        variant="solid"
                        color="warning"
                        startContent={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onPress={() => handleOpenApprove(user)}
                        className="font-bold text-xs h-7 text-white"
                      >
                        Verifikasi
                      </Button>
                    )}

                    {user.status !== 'PENDING_APPROVAL' && user.role !== 'SUPERADMIN' && (
                      <Button
                        size="sm"
                        variant="light"
                        color={user.status === 'ACTIVE' ? 'danger' : 'success'}
                        onPress={() => handleToggleStatus(user)}
                        className="text-xs h-7 font-medium"
                      >
                        {user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL 1: CREATE INTERNAL STAFF */}
      <Modal isOpen={isCreateStaffOpen} onOpenChange={onOpenChangeCreateStaff} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Tambah Akun Staf Internal Baru
            </h2>
            <p className="text-xs text-neutral-500 font-normal">
              Buat akun langsung untuk tim Central Kitchen, Gudang Logistik, atau Pembelian.
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap Staf"
                placeholder="e.g. Bambang Pratama"
                value={staffFullName}
                onValueChange={setStaffFullName}
                isRequired
              />
              <Select
                label="Peran / Role"
                selectedKeys={[staffRole]}
                onChange={(e) => setStaffRole(e.target.value as UserRole)}
                isRequired
              >
                <SelectItem key="KITCHEN_MANAGER">KITCHEN_MANAGER (Kepala Central Kitchen & Resep)</SelectItem>
                <SelectItem key="WAREHOUSE_LOGISTICS">WAREHOUSE_LOGISTICS (Staf Gudang & Mutasi)</SelectItem>
                <SelectItem key="PROCUREMENT_OFFICER">PROCUREMENT_OFFICER (Purchasing & PO)</SelectItem>
                <SelectItem key="SUPERADMIN">SUPERADMIN (Akses Penuh)</SelectItem>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Username"
                placeholder="bambang.kitchen"
                value={staffUsername}
                onValueChange={setStaffUsername}
                isRequired
              />
              <Input
                type="email"
                label="Email Perusahaan"
                placeholder="bambang@fooderp.com"
                value={staffEmail}
                onValueChange={setStaffEmail}
                isRequired
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="password"
                label="Password Default"
                placeholder="Minimal 6 karakter"
                value={staffPassword}
                onValueChange={setStaffPassword}
                isRequired
              />
              <Input
                label="Nomor Telepon / HP"
                placeholder="+62 8..."
                value={staffPhone}
                onValueChange={setStaffPhone}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseCreateStaff}>
              Batal
            </Button>
            <Button color="primary" onPress={handleSubmitCreateStaff} isLoading={isSubmitting} className="font-bold">
              Buat Akun Staf
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL 2: APPROVE / REJECT MITRA */}
      <Modal isOpen={isApproveOpen} onOpenChange={onOpenChangeApprove} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Verifikasi & Approval Pengajuan Mitra: {selectedUser?.partnerName}
            </h2>
            <p className="text-xs text-neutral-500 font-normal">
              Periksa legalitas atau kaitkan akun mitra dengan master data Outlet Pelanggan / Supplier.
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-400 block">Nama Usaha / Outlet:</span>
                  <strong className="text-neutral-900 dark:text-white text-sm">{selectedUser?.partnerName}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Kategori Mitra:</span>
                  <strong className="text-blue-600 dark:text-blue-400">{selectedUser?.role}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Nama PIC & Kontak:</span>
                  <strong className="text-neutral-900 dark:text-white">{selectedUser?.fullName} ({selectedUser?.phone || '-'})</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Email & Username:</span>
                  <strong className="text-neutral-900 dark:text-white">{selectedUser?.email} (@{selectedUser?.username})</strong>
                </div>
              </div>

              {selectedUser?.approvalNotes && (
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 text-neutral-500 italic">
                  &quot;{selectedUser.approvalNotes}&quot;
                </div>
              )}
            </div>

            <Select
              label="Keputusan Verifikasi"
              selectedKeys={[approvalAction]}
              onChange={(e) => setApprovalAction(e.target.value as 'APPROVE' | 'REJECT')}
              isRequired
            >
              <SelectItem key="APPROVE">Setujui (APPROVE) & Aktifkan Akses Portal</SelectItem>
              <SelectItem key="REJECT">Tolak (REJECT) Pendaftaran</SelectItem>
            </Select>

            {approvalAction === 'APPROVE' && selectedUser?.role === 'MITRA_OUTLET' && (
              <Select
                label="Tautkan ke Master Outlet Restoran (Customer)"
                selectedKeys={selectedCustomerId ? [selectedCustomerId] : []}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <SelectItem key={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </Select>
            )}

            {approvalAction === 'APPROVE' && selectedUser?.role === 'SUPPLIER_VENDOR' && (
              <Select
                label="Tautkan ke Master Vendor Supplier"
                selectedKeys={selectedSupplierId ? [selectedSupplierId] : []}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
              >
                {suppliers.map((s) => (
                  <SelectItem key={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </Select>
            )}

            <Textarea
              label="Catatan Verifikasi / Alasan Penolakan"
              placeholder="e.g. Dokumen MOU kemitraan telah diverifikasi lengkap..."
              value={approvalNotes}
              onValueChange={setApprovalNotes}
              rows={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseApprove}>
              Batal
            </Button>
            <Button
              color={approvalAction === 'APPROVE' ? 'success' : 'danger'}
              onPress={handleSubmitApprove}
              isLoading={isSubmitting}
              className="text-white font-bold"
            >
              Simpan Keputusan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
