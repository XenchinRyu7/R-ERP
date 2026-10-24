import React, { useState } from 'react';
import {
  Plus,
  Eye,
  Truck,
  Trash,
  BoxSelect,
  ThermometerSnowflake,
  Layers,
  MapPin,
  Boxes,
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
  Tab,
} from '@heroui/react';
import { PurchaseOrder, Supplier, Product, Warehouse } from '../types/erp';
import { erpApi } from '../api/erpApi';
import {
  getProductStorageLocation,
  getRecommendedWarehouseForSupplierOrder,
  WAREHOUSE_PROFILES,
} from '../utils/warehouseZones';

interface ProcurementPageProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  warehouses: Warehouse[];
  onRefresh: () => void;
  onOpenReceive?: (po: PurchaseOrder) => void;
}

export const ProcurementPage: React.FC<ProcurementPageProps> = ({
  purchaseOrders,
  suppliers,
  products,
  warehouses,
  onRefresh,
  onOpenReceive,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewingPo, setViewingPo] = useState<PurchaseOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New PO disclosure
  const {
    isOpen: isCreateOpen,
    onOpen: onOpenCreate,
    onOpenChange: onOpenChangeCreate,
    onClose: onCloseCreate,
  } = useDisclosure();

  // View PO disclosure
  const {
    isOpen: isViewOpen,
    onOpen: onOpenView,
    onOpenChange: onOpenChangeView,
    onClose: onCloseView,
  } = useDisclosure();

  // Create PO form state
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [createdBy, setCreatedBy] = useState('Procurement Manager');
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number }>
  >([]);

  // Filter warehouses for supplier inbound: Central Cold Storage or Central Dry Hub
  const supplierInboundWarehouses = warehouses.filter(
    (w) => w.code.includes('COLD') || w.code.includes('DRY')
  );
  const availableWhs = supplierInboundWarehouses.length > 0 ? supplierInboundWarehouses : warehouses;

  const handleOpenCreateModal = () => {
    setSelectedSupplierId(suppliers[0]?.id || '');
    setNotes('');
    setCreatedBy('Procurement Officer');
    if (products.length > 0) {
      const initialItems = [
        {
          productId: products[0].id,
          quantity: 10,
          unitPrice: Number(products[0].purchasePrice) || 0,
        },
      ];
      setItems(initialItems);
      const rec = getRecommendedWarehouseForSupplierOrder([products[0]], availableWhs);
      setSelectedWarehouseId(rec.warehouseId);
    } else {
      setItems([]);
      setSelectedWarehouseId(availableWhs[0]?.id || '');
    }
    onOpenCreate();
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      {
        productId: products[0].id,
        quantity: 5,
        unitPrice: Number(products[0].purchasePrice) || 0,
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
        updated[index].unitPrice = Number(prod.purchasePrice) || 0;
      }
      const prodsInOrder = updated
        .map((i) => products.find((p) => p.id === i.productId))
        .filter(Boolean) as Product[];
      const rec = getRecommendedWarehouseForSupplierOrder(prodsInOrder, availableWhs);
      if (rec.warehouseId) {
        setSelectedWarehouseId(rec.warehouseId);
      }
    } else if (field === 'quantity') {
      updated[index].quantity = Number(val);
    } else if (field === 'unitPrice') {
      updated[index].unitPrice = Number(val);
    }
    setItems(updated);
  };

  const totalCalculated = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleCreatePo = async () => {
    if (!selectedSupplierId) {
      alert('Please select a supplier.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one product item.');
      return;
    }

    const targetWh = warehouses.find((w) => w.id === selectedWarehouseId);
    const deliveryGuidance = targetWh
      ? `Inbound Tujuan: ${targetWh.name} (${targetWh.code})`
      : 'Inbound Warehouse';
    const finalNotes = notes ? `${notes} | ${deliveryGuidance}` : deliveryGuidance;

    setIsSubmitting(true);
    try {
      await erpApi.createPurchaseOrder({
        supplierId: selectedSupplierId,
        notes: finalNotes,
        createdBy,
        items,
      });
      onCloseCreate();
      onRefresh();
    } catch (err: any) {
      alert('Error creating PO: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await erpApi.updatePurchaseOrderStatus(id, status);
      if (viewingPo && viewingPo.id === id) {
        setViewingPo({ ...viewingPo, status: status as any });
      }
      onRefresh();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredOrders = purchaseOrders.filter((po) => {
    if (selectedStatus === 'all') return true;
    return po.status === selectedStatus;
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return <Chip size="sm" variant="flat" color="success" className="font-bold text-[10px]">RECEIVED</Chip>;
      case 'PARTIALLY_RECEIVED':
        return <Chip size="sm" variant="flat" color="secondary" className="font-bold text-[10px]">PARTIALLY RECEIVED</Chip>;
      case 'APPROVED':
        return <Chip size="sm" variant="flat" color="primary" className="font-bold text-[10px]">APPROVED</Chip>;
      case 'SUBMITTED':
        return <Chip size="sm" variant="flat" color="warning" className="font-bold text-[10px]">SUBMITTED</Chip>;
      case 'CANCELLED':
        return <Chip size="sm" variant="flat" color="danger" className="font-bold text-[10px]">CANCELLED</Chip>;
      default:
        return <Chip size="sm" variant="flat" className="font-bold text-[10px]">{status}</Chip>;
    }
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
          <Tab key="all" title={`All Orders (${purchaseOrders.length})`} />
          <Tab key="SUBMITTED" title="Submitted" />
          <Tab key="APPROVED" title="Approved" />
          <Tab key="RECEIVED" title="Received" />
        </Tabs>

        <Button
          color="primary"
          size="sm"
          className="font-semibold shadow-md shadow-blue-500/20"
          startContent={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
        >
          Create Purchase Order
        </Button>
      </div>

      {/* PO Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <Table aria-label="Purchase Orders Table" shadow="none">
          <TableHeader>
            <TableColumn>PO NUMBER</TableColumn>
            <TableColumn>SUPPLIER</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>ITEMS</TableColumn>
            <TableColumn>TOTAL AMOUNT</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn className="text-right">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No purchase orders found.">
            {filteredOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                    {po.orderNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 block">
                      {po.supplierName}
                    </span>
                    <span className="text-[10px] text-neutral-400">{po.supplierCode}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-neutral-500">
                  {new Date(po.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  {po.items?.length ?? 0} item(s)
                </TableCell>
                <TableCell className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {formatIDR(po.totalAmount)}
                </TableCell>
                <TableCell>{getStatusChip(po.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => {
                        setViewingPo(po);
                        onOpenView();
                      }}
                      className="text-xs h-7 px-2"
                      startContent={<Eye className="w-3.5 h-3.5" />}
                    >
                      Details
                    </Button>
                    {po.status === 'SUBMITTED' && (
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => handleStatusChange(po.id, 'APPROVED')}
                        className="text-xs h-7 px-2.5 font-semibold"
                      >
                        Approve
                      </Button>
                    )}
                    {(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') && onOpenReceive && (
                      <Button
                        size="sm"
                        color="success"
                        className="text-white text-xs h-7 px-2.5 font-semibold"
                        onClick={() => onOpenReceive(po)}
                        startContent={<Truck className="w-3.5 h-3.5" />}
                      >
                        Receive
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create PO Modal */}
      <Modal isOpen={isCreateOpen} onOpenChange={onOpenChangeCreate} size="3xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-base font-bold">Create Inbound Purchase Order</h3>
            <p className="text-xs font-normal text-neutral-500">
              Procure ingredients, materials, or packaging from verified food suppliers.
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Select Supplier"
                size="sm"
                placeholder="Pilih Supplier Rekanan"
                selectedKeys={selectedSupplierId ? new Set([selectedSupplierId]) : new Set([])}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  if (val) setSelectedSupplierId(val);
                }}
                isRequired
              >
                {suppliers.map((s) => (
                  <SelectItem key={s.id} textValue={`${s.name} (${s.code})`}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Gudang Tujuan Penerimaan (Supplier Inbound Hub)"
                size="sm"
                placeholder="Pilih Gudang Penerimaan"
                selectedKeys={selectedWarehouseId ? new Set([selectedWarehouseId]) : new Set([])}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  if (val) setSelectedWarehouseId(val);
                }}
                isRequired
              >
                {availableWhs.map((w) => {
                  const isCold = w.code.includes('COLD');
                  return (
                    <SelectItem key={w.id} textValue={`${w.name} (${w.code})`}>
                      {w.name} ({w.code}) {isCold ? '❄️ [-18°C]' : '📦 [Dry]'}
                    </SelectItem>
                  );
                })}
              </Select>
            </div>

            {selectedWarehouseId && (() => {
              const targetWh = warehouses.find((w) => w.id === selectedWarehouseId);
              const isCold = targetWh?.code.includes('COLD');
              return (
                <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  isCold
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/60 text-blue-800 dark:text-blue-300'
                    : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                }`}>
                  <span className="flex items-center gap-1.5 font-medium">
                    {isCold ? <ThermometerSnowflake className="w-4 h-4 text-blue-600 shrink-0" /> : <Boxes className="w-4 h-4 text-amber-600 shrink-0" />}
                    <span>
                      <strong>Inbound Hub:</strong> {targetWh?.name} ({targetWh?.code}) &bull;{' '}
                      {isCold ? 'Khusus Bahan Dingin/Beku (Suhu -18°C ~ 4°C)' : 'Khusus Bahan Kering/Packaging (Ambient)'}
                    </span>
                  </span>
                </div>
              );
            })()}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Order Line Items & Alokasi Kotak/Rak
                </h4>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onClick={handleAddItem}
                  startContent={<Plus className="w-3.5 h-3.5" />}
                  className="h-7 text-xs font-semibold"
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId);
                  const loc = getProductStorageLocation(prod?.code, prod?.categoryName, selectedWh?.code);

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1.5"
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <Select
                            size="sm"
                            label="Product"
                            placeholder="Pilih Produk..."
                            selectedKeys={item.productId ? new Set([item.productId]) : new Set([])}
                            onSelectionChange={(keys) => {
                              const val = Array.from(keys)[0] as string;
                              if (val) handleItemChange(idx, 'productId', val);
                            }}
                            aria-label={`PO Product item ${idx + 1}`}
                          >
                            {products.map((p) => (
                              <SelectItem key={p.id} textValue={`${p.name} (${p.unit})`}>
                                {p.name} ({p.unit})
                              </SelectItem>
                            ))}
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <Input
                            type="number"
                            size="sm"
                            label="Qty"
                            value={item.quantity.toString()}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          />
                        </div>

                        <div className="col-span-3">
                          <Input
                            type="number"
                            size="sm"
                            label="Unit Price (IDR)"
                            value={item.unitPrice.toString()}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          />
                        </div>

                        <div className="col-span-1 text-right text-xs font-bold text-neutral-800 dark:text-neutral-200">
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

                      <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/40 dark:border-blue-900/30">
                        <span className="text-neutral-500 flex items-center gap-1 font-medium">
                          <BoxSelect className="w-3 h-3 text-blue-600" />
                          Alokasi Kotak & Rak:
                        </span>
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                          {loc.rack} &bull; {loc.bin} <span className="text-[10px] text-neutral-400 font-normal">({loc.zone})</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-800 text-sm">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Total Purchase Order:</span>
                <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">
                  {formatIDR(totalCalculated)}
                </span>
              </div>
            </div>

            <Textarea
              label="Delivery & Handling Notes"
              size="sm"
              placeholder="e.g. Cold truck delivery required, maintain temperature below 4°C"
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
              onClick={handleCreatePo}
              isLoading={isSubmitting}
              className="font-semibold"
            >
              Submit Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View PO Details Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onOpenChangeView} size="2xl">
        <ModalContent>
          <ModalHeader className="flex justify-between items-center pr-6">
            <div>
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                {viewingPo?.orderNumber}
              </span>
              <h3 className="text-base font-bold">Purchase Order Overview</h3>
            </div>
            {viewingPo && getStatusChip(viewingPo.status)}
          </ModalHeader>
          <ModalBody className="space-y-4">
            {viewingPo && (
              <>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                  <div>
                    <p className="text-neutral-400">Supplier</p>
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{viewingPo.supplierName}</p>
                    <p className="text-neutral-500 font-mono text-[11px]">{viewingPo.supplierCode}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Order Date & Created By</p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {new Date(viewingPo.createdAt).toLocaleString()}
                    </p>
                    <p className="text-neutral-500">{viewingPo.createdBy}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-neutral-500">Ordered Items</h4>
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        <tr>
                          <th className="p-2.5">Product</th>
                          <th className="p-2.5">Alokasi Kotak & Rak</th>
                          <th className="p-2.5">Ordered</th>
                          <th className="p-2.5">Received</th>
                          <th className="p-2.5">Unit Price</th>
                          <th className="p-2.5 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {viewingPo.items?.map((item) => {
                          const loc = getProductStorageLocation(item.productCode);
                          return (
                            <tr key={item.id}>
                              <td className="p-2.5 font-semibold text-neutral-900 dark:text-neutral-100">
                                {item.productName}
                                <span className="block text-[10px] text-neutral-400">{item.productCode}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                                  {loc.rack} &bull; {loc.bin}
                                </span>
                                <span className="block text-[10px] text-neutral-400">{loc.zone}</span>
                              </td>
                              <td className="p-2.5">{item.quantity} {item.unit}</td>
                              <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">
                                {item.receivedQuantity ?? 0} {item.unit}
                              </td>
                              <td className="p-2.5">{formatIDR(item.unitPrice)}</td>
                              <td className="p-2.5 text-right font-bold">{formatIDR(item.subtotal || 0)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {viewingPo.notes && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs">
                    <span className="font-bold">Notes: </span>{viewingPo.notes}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-sm font-bold">
                  <span>Grand Total:</span>
                  <span className="text-lg text-blue-600 dark:text-blue-400">
                    {formatIDR(viewingPo.totalAmount)}
                  </span>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="flat" onClick={onCloseView}>
              Close
            </Button>
            {viewingPo?.status === 'SUBMITTED' && (
              <Button
                size="sm"
                color="primary"
                onClick={() => handleStatusChange(viewingPo.id, 'APPROVED')}
              >
                Approve PO
              </Button>
            )}
            {(viewingPo?.status === 'APPROVED' || viewingPo?.status === 'PARTIALLY_RECEIVED') && onOpenReceive && (
              <Button
                size="sm"
                color="success"
                className="text-white font-semibold"
                onClick={() => {
                  onCloseView();
                  onOpenReceive(viewingPo);
                }}
              >
                Proceed to Receiving
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
