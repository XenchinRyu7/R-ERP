import React, { useState } from 'react';
import {
  Plus,
  Eye,
  Truck,
  CheckCircle2,
  Trash,
  Store,
  Building
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
  Textarea,
  Tabs,
  Tab
} from '@heroui/react';
import { SalesOrder, Customer, Warehouse, Product, AuthUser } from '../types/erp';
import { erpApi } from '../api/erpApi';

interface SalesPageProps {
  salesOrders: SalesOrder[];
  customers: Customer[];
  warehouses: Warehouse[];
  products: Product[];
  onRefresh: () => void;
  currentUser?: AuthUser | null;
}

export const SalesPage: React.FC<SalesPageProps> = ({
  salesOrders,
  customers,
  warehouses,
  products,
  onRefresh,
  currentUser,
}) => {
  const isMitra = currentUser?.role === 'MITRA_OUTLET';

  // Filter orders for mitra
  const roleFilteredOrders = isMitra
    ? salesOrders.filter((so) => {
        if (currentUser?.customerId && so.customerId === currentUser.customerId) return true;
        if (currentUser?.partnerName && so.customerName && so.customerName.toLowerCase().includes(currentUser.partnerName.toLowerCase())) return true;
        return false;
      })
    : salesOrders;

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewingSo, setViewingSo] = useState<SalesOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New SO disclosure
  const {
    isOpen: isCreateOpen,
    onOpen: onOpenCreate,
    onOpenChange: onOpenChangeCreate,
    onClose: onCloseCreate,
  } = useDisclosure();

  // View SO disclosure
  const {
    isOpen: isViewOpen,
    onOpen: onOpenView,
    onOpenChange: onOpenChangeView,
    onClose: onCloseView,
  } = useDisclosure();

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [createdBy, setCreatedBy] = useState('Central Sales Officer');
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number }>
  >([]);

  const handleOpenCreate = () => {
    let targetCustId = customers[0]?.id || '';
    if (isMitra) {
      if (currentUser?.customerId && customers.some((c) => c.id === currentUser.customerId)) {
        targetCustId = currentUser.customerId;
      } else if (currentUser?.partnerName) {
        const match = customers.find((c) =>
          c.name.toLowerCase().includes(currentUser.partnerName!.toLowerCase())
        );
        if (match) targetCustId = match.id;
      }
    }
    // Fallback to first customer if mapped ID doesn't exist in customer table
    if (!customers.some((c) => c.id === targetCustId) && customers.length > 0) {
      targetCustId = customers[0].id;
    }
    setSelectedCustomerId(targetCustId);
    setSelectedWarehouseId(warehouses[0]?.id || '');
    setNotes(isMitra ? `Pesanan restock cabang oleh: ${currentUser?.fullName || currentUser?.username}` : '');
    setCreatedBy(currentUser?.fullName || (isMitra ? 'PIC Mitra Outlet' : 'Branch Dispatch Rep'));

    if (products.length > 0) {
      setItems([
        {
          productId: products[0].id,
          quantity: 5,
          unitPrice: Number(products[0].sellingPrice) || 0,
        },
      ]);
    } else {
      setItems([]);
    }
    onOpenCreate();
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      {
        productId: products[0].id,
        quantity: 2,
        unitPrice: Number(products[0].sellingPrice) || 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === val);
      updated[index].productId = val;
      if (prod) {
        updated[index].unitPrice = Number(prod.sellingPrice) || 0;
      }
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(1, Number(val) || 1);
    } else if (field === 'unitPrice') {
      updated[index].unitPrice = Math.max(0, Number(val) || 0);
    }
    setItems(updated);
  };

  const totalCalculated = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleCreateOrder = async () => {
    if (!selectedCustomerId || !selectedWarehouseId) {
      alert('Please select customer branch and warehouse.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    setIsSubmitting(true);
    try {
      await erpApi.createSalesOrder({
        customerId: selectedCustomerId,
        warehouseId: selectedWarehouseId,
        notes,
        createdBy,
        items,
      });
      onCloseCreate();
      onRefresh();
    } catch (err: any) {
      alert('Error creating sales order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await erpApi.updateSalesOrderStatus(id, status);
      if (viewingSo && viewingSo.id === id) {
        setViewingSo({ ...viewingSo, status: status as any });
      }
      onRefresh();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredOrders = roleFilteredOrders.filter((so) => {
    if (selectedStatus === 'all') return true;
    return so.status === selectedStatus;
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs
          selectedKey={selectedStatus}
          onSelectionChange={(key: React.Key) => setSelectedStatus(key as string)}
          size="sm"
          color="primary"
          variant="underlined"
        >
          <Tab key="all" title={`All Orders (${roleFilteredOrders.length})`} />
          <Tab key="CONFIRMED" title="Confirmed" />
          <Tab key="SHIPPED" title="Shipped" />
          <Tab key="DELIVERED" title="Delivered" />
        </Tabs>

        <Button
          color="primary"
          size="sm"
          className="font-semibold shadow-md shadow-blue-500/20"
          startContent={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          {isMitra ? 'Ajukan Pesanan Restock' : 'Create Branch Order'}
        </Button>
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <Table aria-label="Sales Orders Table" shadow="none">
          <TableHeader>
            <TableColumn>ORDER #</TableColumn>
            <TableColumn>BRANCH / OUTLET</TableColumn>
            <TableColumn>SOURCE WAREHOUSE</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>ITEMS</TableColumn>
            <TableColumn>TOTAL</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn className="text-right">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No sales orders found.">
            {filteredOrders.map((so) => (
              <TableRow key={so.id}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                    {so.orderNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 block">
                      {so.customerName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{so.customerCode}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-neutral-700 dark:text-neutral-300">
                  {so.warehouseName}
                </TableCell>
                <TableCell className="text-xs text-neutral-500">
                  {new Date(so.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {so.items?.length ?? 0} item(s)
                </TableCell>
                <TableCell className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {formatIDR(so.totalAmount)}
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      so.status === 'DELIVERED'
                        ? 'success'
                        : so.status === 'SHIPPED'
                        ? 'secondary'
                        : so.status === 'CONFIRMED'
                        ? 'primary'
                        : 'default'
                    }
                    className="text-[10px] font-bold"
                  >
                    {so.status}
                  </Chip>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => {
                        setViewingSo(so);
                        onOpenView();
                      }}
                      className="text-xs h-7 px-2"
                      startContent={<Eye className="w-3.5 h-3.5" />}
                    >
                      Details
                    </Button>
                    {!isMitra && so.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        color="secondary"
                        onClick={() => handleStatusChange(so.id, 'SHIPPED')}
                        className="text-xs h-7 px-2 font-semibold"
                        startContent={<Truck className="w-3.5 h-3.5" />}
                      >
                        Ship
                      </Button>
                    )}
                    {so.status === 'SHIPPED' && (
                      <Button
                        size="sm"
                        color="success"
                        className="text-white text-xs h-7 px-2 font-semibold"
                        onClick={() => handleStatusChange(so.id, 'DELIVERED')}
                        startContent={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        {isMitra ? 'Konfirmasi Terima' : 'Delivered'}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onOpenChange={onOpenChangeCreate} size="3xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-base font-bold">Create Outlet / Branch Order</h3>
            <p className="text-xs text-neutral-500 font-normal">
              Fulfill kitchen materials, ingredients, or retail items to restaurant locations.
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isMitra ? (
                <div className="p-3 bg-neutral-100/90 dark:bg-neutral-800/90 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Cabang Outlet Pemesan
                  </span>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span>{customers.find((c) => c.id === selectedCustomerId)?.name || currentUser?.partnerName || currentUser?.customerName || 'Cabang Restoran Anda'}</span>
                    <Chip size="sm" color="success" variant="flat" className="h-4 text-[10px] px-1 font-semibold ml-auto">
                      Outlet Anda
                    </Chip>
                  </p>
                </div>
              ) : (
                <Select
                  label="Destination Restaurant Outlet"
                  size="sm"
                  placeholder="Pilih Cabang Outlet"
                  selectedKeys={selectedCustomerId ? new Set([selectedCustomerId]) : new Set([])}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    if (val) setSelectedCustomerId(val);
                  }}
                  isRequired
                >
                  {customers.map((c) => (
                    <SelectItem key={c.id} textValue={c.name}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </Select>
              )}

              <Select
                label="Fulfillment Warehouse (Gudang Asal)"
                size="sm"
                placeholder="Pilih Gudang Asal"
                selectedKeys={selectedWarehouseId ? new Set([selectedWarehouseId]) : new Set([])}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  if (val) setSelectedWarehouseId(val);
                }}
                isRequired
              >
                {warehouses.map((w) => (
                  <SelectItem key={w.id} textValue={w.name}>
                    {w.name} ({w.code})
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Daftar Bahan / Produk Pesanan
                </h4>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onClick={handleAddItem}
                  startContent={<Plus className="w-3.5 h-3.5" />}
                  className="h-7 text-xs font-semibold"
                >
                  Tambah Baris Produk
                </Button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2.5 items-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80"
                  >
                    <div className="col-span-5">
                      <Select
                        size="sm"
                        label="Produk / Bahan Baku"
                        placeholder="Pilih Bahan Baku..."
                        selectedKeys={item.productId ? new Set([item.productId]) : new Set([])}
                        onSelectionChange={(keys) => {
                          const val = Array.from(keys)[0] as string;
                          if (val) handleItemChange(idx, 'productId', val);
                        }}
                        aria-label={`Produk item ${idx + 1}`}
                      >
                        {products.map((p) => (
                          <SelectItem
                            key={p.id}
                            textValue={`${p.name} (${p.unit})`}
                          >
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-mono">
                                {formatIDR(p.sellingPrice)} / {p.unit}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        size="sm"
                        label="Kuantitas"
                        min="1"
                        value={item.quantity.toString()}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      />
                    </div>

                    <div className="col-span-3">
                      <Input
                        type="number"
                        size="sm"
                        label="Harga Satuan (IDR)"
                        value={item.unitPrice.toString()}
                        isReadOnly={isMitra}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      />
                    </div>

                    <div className="col-span-1 text-right text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {formatIDR(item.quantity * item.unitPrice)}
                    </div>

                    <div className="col-span-1 text-right">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-neutral-400 hover:text-rose-600"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-800 text-sm">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Total Invoice:</span>
                <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">
                  {formatIDR(totalCalculated)}
                </span>
              </div>
            </div>

            <Textarea
              label="Delivery Instructions"
              size="sm"
              placeholder="e.g. Deliver before 10 AM before restaurant opening"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="flat" onClick={onCloseCreate}>
              Cancel
            </Button>
            <Button
              size="sm"
              color="primary"
              onClick={handleCreateOrder}
              isLoading={isSubmitting}
              className="font-semibold"
            >
              Confirm & Dispatch
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View SO Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onOpenChangeView} size="2xl">
        <ModalContent>
          <ModalHeader className="flex justify-between items-center pr-6">
            <div>
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                {viewingSo?.orderNumber}
              </span>
              <h3 className="text-base font-bold">Branch Order Details</h3>
            </div>
            {viewingSo && (
              <Chip size="sm" variant="flat" color="primary" className="font-bold">
                {viewingSo.status}
              </Chip>
            )}
          </ModalHeader>
          <ModalBody className="space-y-4">
            {viewingSo && (
              <>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                  <div>
                    <p className="text-neutral-400">Customer Outlet</p>
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{viewingSo.customerName}</p>
                    <p className="text-neutral-500 font-mono text-[11px]">{viewingSo.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Source Warehouse</p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{viewingSo.warehouseName}</p>
                    <p className="text-neutral-500">{new Date(viewingSo.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-neutral-500">Ordered Items</h4>
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        <tr>
                          <th className="p-2.5">Product</th>
                          <th className="p-2.5">Quantity</th>
                          <th className="p-2.5">Unit Price</th>
                          <th className="p-2.5 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {viewingSo.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2.5 font-semibold text-neutral-900 dark:text-neutral-100">
                              {item.productName}
                              <span className="block text-[10px] text-neutral-400">{item.productCode}</span>
                            </td>
                            <td className="p-2.5">{item.quantity} {item.unit}</td>
                            <td className="p-2.5">{formatIDR(item.unitPrice)}</td>
                            <td className="p-2.5 text-right font-bold">{formatIDR(item.subtotal || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {viewingSo.notes && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 text-xs">
                    <span className="font-bold">Instructions: </span>{viewingSo.notes}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-sm font-bold">
                  <span>Grand Total:</span>
                  <span className="text-lg text-blue-600 dark:text-blue-400">
                    {formatIDR(viewingSo.totalAmount)}
                  </span>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="flat" onClick={onCloseView}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
