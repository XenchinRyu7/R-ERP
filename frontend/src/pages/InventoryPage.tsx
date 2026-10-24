import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Truck,
  AlertTriangle,
  Search,
  ArrowDownToLine,
  SlidersHorizontal,
  MapPin,
  BoxSelect,
  Thermometer,
  Building2,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Textarea
} from '@heroui/react';
import {
  InventoryStock,
  GoodsReceipt,
  PurchaseOrder,
  Warehouse,
  Product,
  AuthUser,
} from '../types/erp';
import { erpApi } from '../api/erpApi';
import { getProductStorageLocation, WAREHOUSE_PROFILES } from '../utils/warehouseZones';

interface InventoryPageProps {
  stocks: InventoryStock[];
  receipts: GoodsReceipt[];
  warehouses: Warehouse[];
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  onRefresh: () => void;
  preselectedPoForReceive?: PurchaseOrder | null;
  onClearPreselectedPo?: () => void;
  currentUser?: AuthUser | null;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  stocks,
  receipts,
  warehouses,
  products,
  purchaseOrders,
  onRefresh,
  preselectedPoForReceive,
  onClearPreselectedPo,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'receipts'>('stocks');
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(
    currentUser?.warehouseId || 'all'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receive Modal
  const {
    isOpen: isReceiveOpen,
    onOpen: onOpenReceive,
    onOpenChange: onOpenChangeReceive,
    onClose: onCloseReceive,
  } = useDisclosure();

  // Adjust Modal
  const {
    isOpen: isAdjustOpen,
    onOpen: onOpenAdjust,
    onOpenChange: onOpenChangeAdjust,
    onClose: onCloseAdjust,
  } = useDisclosure();

  // Receive Form
  const [receivePoId, setReceivePoId] = useState<string>('');
  const [receiveWhId, setReceiveWhId] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState('Warehouse Inspector');
  const [receiveNotes, setReceiveNotes] = useState('');
  const [receiveItems, setReceiveItems] = useState<
    Array<{ productId: string; quantity: number; unitCost: number }>
  >([]);

  // Adjust Form
  const [adjustStockItem, setAdjustStockItem] = useState<InventoryStock | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustNotes, setAdjustNotes] = useState('');

  useEffect(() => {
    if (preselectedPoForReceive) {
      setReceivePoId(preselectedPoForReceive.id);
      setReceiveWhId(warehouses[0]?.id || '');
      setReceiveNotes(`Received from order ${preselectedPoForReceive.orderNumber}`);
      setReceiveItems(
        preselectedPoForReceive.items.map((i) => ({
          productId: i.productId,
          quantity: Math.max(0, (i.quantity || 0) - (i.receivedQuantity || 0)),
          unitCost: Number(i.unitPrice) || 0,
        }))
      );
      onOpenReceive();
      if (onClearPreselectedPo) onClearPreselectedPo();
    }
  }, [preselectedPoForReceive, warehouses, onOpenReceive, onClearPreselectedPo]);

  const handleOpenNewReceive = () => {
    setReceivePoId('');
    setReceiveWhId(warehouses[0]?.id || '');
    setReceiveNotes('');
    setReceivedBy('Warehouse Staff');
    if (products.length > 0) {
      setReceiveItems([
        {
          productId: products[0].id,
          quantity: 10,
          unitCost: Number(products[0].purchasePrice) || 0,
        },
      ]);
    } else {
      setReceiveItems([]);
    }
    onOpenReceive();
  };

  const handlePoSelect = (poId: string) => {
    setReceivePoId(poId);
    const foundPo = purchaseOrders.find((p) => p.id === poId);
    if (foundPo) {
      setReceiveNotes(`Received against ${foundPo.orderNumber}`);
      setReceiveItems(
        foundPo.items.map((i) => ({
          productId: i.productId,
          quantity: Math.max(0, (i.quantity || 0) - (i.receivedQuantity || 0)),
          unitCost: Number(i.unitPrice) || 0,
        }))
      );
    }
  };

  const handleReceiveItemChange = (index: number, field: string, val: any) => {
    const updated = [...receiveItems];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === val);
      updated[index].productId = val;
      if (prod) updated[index].unitCost = Number(prod.purchasePrice) || 0;
    } else if (field === 'quantity') {
      updated[index].quantity = Number(val);
    } else if (field === 'unitCost') {
      updated[index].unitCost = Number(val);
    }
    setReceiveItems(updated);
  };

  const handleSubmitReceive = async () => {
    if (!receiveWhId) {
      alert('Please select warehouse.');
      return;
    }
    if (receiveItems.length === 0) {
      alert('Please include items to receive.');
      return;
    }

    setIsSubmitting(true);
    try {
      await erpApi.createGoodsReceipt({
        purchaseOrderId: receivePoId || undefined,
        warehouseId: receiveWhId,
        notes: receiveNotes,
        receivedBy,
        items: receiveItems,
      });
      onCloseReceive();
      onRefresh();
    } catch (err: any) {
      alert('Error receiving goods: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAdjustModal = (stock: InventoryStock) => {
    setAdjustStockItem(stock);
    setAdjustQty(stock.quantity);
    setAdjustNotes('Physical cycle count correction');
    onOpenAdjust();
  };

  const handleSubmitAdjust = async () => {
    if (!adjustStockItem) return;
    setIsSubmitting(true);
    try {
      await erpApi.adjustStock({
        productId: adjustStockItem.productId,
        warehouseId: adjustStockItem.warehouseId,
        quantity: Number(adjustQty),
        notes: adjustNotes,
      });
      onCloseAdjust();
      onRefresh();
    } catch (err: any) {
      alert('Error adjusting stock: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStocks = stocks.filter((s) => {
    const matchSearch =
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.productCode.toLowerCase().includes(search.toLowerCase());
    const matchWh =
      selectedWarehouse === 'all' || s.warehouseId === selectedWarehouse;
    return matchSearch && matchWh;
  });

  return (
    <div className="space-y-6">
      {currentUser?.warehouseName && (
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-medium">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Fasilitas Penugasan Anda:</strong> {currentUser.warehouseName} ({currentUser.warehouseCode || ''}) &bull; Tampilan stok dan pergerakan difokuskan pada gudang tugas Anda.
            </span>
          </div>
          <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">
            Gudang Ditugaskan
          </Chip>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key: React.Key) => setActiveTab(key as any)}
          color="primary"
          variant="solid"
          size="sm"
        >
          <Tab
            key="stocks"
            title={
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4" />
                <span>Live Stock Levels ({stocks.length})</span>
              </div>
            }
          />
          <Tab
            key="receipts"
            title={
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Goods Receipts Log ({receipts.length})</span>
              </div>
            }
          />
        </Tabs>

        <div className="flex items-center gap-3">
          {activeTab === 'stocks' && (
            <>
              <Input
                size="sm"
                placeholder="Search stocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startContent={<Search className="w-4 h-4 text-neutral-400" />}
                className="w-48"
              />
              <Select
                size="sm"
                label="Warehouse"
                className="w-52"
                selectedKeys={[selectedWarehouse]}
                onChange={(e) => setSelectedWarehouse(e.target.value || 'all')}
              >
                {[
                  { id: 'all', name: 'All Warehouses' },
                  ...warehouses,
                ].map((w) => (
                  <SelectItem key={w.id}>{w.name}</SelectItem>
                ))}
              </Select>
            </>
          )}

          <Button
            color="primary"
            size="sm"
            className="font-semibold shadow-md shadow-blue-500/20"
            startContent={<ArrowDownToLine className="w-4 h-4" />}
            onClick={handleOpenNewReceive}
          >
            Receive Goods
          </Button>
        </div>
      </div>

      {activeTab === 'stocks' ? (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          <Table aria-label="Live Stock Table" shadow="none">
            <TableHeader>
              <TableColumn>PRODUCT</TableColumn>
              <TableColumn>GUDANG PENYIMPANAN</TableColumn>
              <TableColumn>LOKASI RAK & KOTAK / BIN</TableColumn>
              <TableColumn>ON HAND QTY</TableColumn>
              <TableColumn>SAFETY MIN</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn className="text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No inventory records found.">
              {filteredStocks.map((s) => {
                const loc = getProductStorageLocation(s.productCode, s.categoryName, s.warehouseCode);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 block">
                          {s.productName}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {s.productCode} • {s.categoryName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-xs text-neutral-800 dark:text-neutral-200 font-bold block">
                          {s.warehouseName}
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                          {s.warehouseCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-blue-700 dark:text-blue-300">
                          <BoxSelect className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="font-mono text-[11px] font-bold">
                            {loc.rack} • {loc.bin}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block font-medium">
                          {loc.zone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-extrabold ${s.isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}>
                        {s.quantity} {s.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500">
                      {s.minStock} {s.unit}
                    </TableCell>
                    <TableCell>
                      {s.isLowStock ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="danger"
                          startContent={<AlertTriangle className="w-3 h-3" />}
                          className="text-[10px] h-5 font-bold"
                        >
                          LOW STOCK
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          className="text-[10px] h-5 font-semibold"
                        >
                          ADEQUATE
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => handleOpenAdjustModal(s)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        startContent={<SlidersHorizontal className="w-3 h-3" />}
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Goods Receipts Log */
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          <Table aria-label="Receipts Table" shadow="none">
            <TableHeader>
              <TableColumn>RECEIPT #</TableColumn>
              <TableColumn>LINKED PO</TableColumn>
              <TableColumn>WAREHOUSE</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>RECEIVED BY</TableColumn>
              <TableColumn>ITEMS COUNT</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No goods receipts on record.">
              {receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                      {r.receiptNumber}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                    {r.purchaseOrderNumber || 'Direct Inbound'}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-800 dark:text-neutral-200">
                    {r.warehouseName}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-600 dark:text-neutral-400">
                    {r.receivedBy || '-'}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {r.items?.length ?? 0} item(s)
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="success" className="text-[10px] font-bold">
                      {r.status}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Receive Goods Modal */}
      <Modal isOpen={isReceiveOpen} onOpenChange={onOpenChangeReceive} size="3xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-base font-bold">Receive Inbound Goods into Facility</h3>
            <p className="text-xs text-neutral-500 font-normal">
              Updates physical inventory balance and generates auditable receipt records.
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Destination Warehouse"
                size="sm"
                selectedKeys={receiveWhId ? new Set([receiveWhId]) : new Set([])}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  if (val) setReceiveWhId(val);
                }}
                isRequired
              >
                {warehouses.map((w) => (
                  <SelectItem key={w.id} textValue={`${w.name} (${w.code})`}>
                    {w.name} ({w.code})
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Link to Purchase Order (Optional)"
                size="sm"
                selectedKeys={receivePoId ? new Set([receivePoId]) : new Set([])}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  handlePoSelect(val || '');
                }}
              >
                {[
                  { id: '', label: 'Direct Inbound (No PO)' },
                  ...purchaseOrders
                    .filter((p) => p.status === 'APPROVED' || p.status === 'PARTIALLY_RECEIVED')
                    .map((p) => ({
                      id: p.id,
                      label: `${p.orderNumber} - ${p.supplierName}`,
                    })),
                ].map((opt) => (
                  <SelectItem key={opt.id} textValue={opt.label}>{opt.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-neutral-500">
                Barang yang Diterima & Alokasi Kotak/Rak Penyimpanan
              </h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {receiveItems.map((item, idx) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const selectedWh = warehouses.find((w) => w.id === receiveWhId);
                  const loc = getProductStorageLocation(prod?.code, prod?.categoryName, selectedWh?.code);

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2"
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                          <Select
                            size="sm"
                            label="Product"
                            selectedKeys={item.productId ? new Set([item.productId]) : new Set([])}
                            onSelectionChange={(keys) => {
                              const val = Array.from(keys)[0] as string;
                              if (val) handleReceiveItemChange(idx, 'productId', val);
                            }}
                          >
                            {products.map((p) => (
                              <SelectItem key={p.id} textValue={`${p.name} (${p.unit})`}>
                                {p.name} ({p.unit})
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            size="sm"
                            label="Received Qty"
                            value={item.quantity.toString()}
                            onChange={(e) => handleReceiveItemChange(idx, 'quantity', e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            size="sm"
                            label="Unit Cost"
                            value={item.unitCost.toString()}
                            onChange={(e) => handleReceiveItemChange(idx, 'unitCost', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Storage Kotak & Rak Placement Instruction */}
                      <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40">
                        <span className="text-neutral-500 flex items-center gap-1 font-medium">
                          <BoxSelect className="w-3 h-3 text-blue-600" />
                          Instruksi Taruh Rak & Kotak:
                        </span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-blue-700 dark:text-blue-300">
                            {loc.rack} • {loc.bin}
                          </span>
                          <span className="text-[10px] text-neutral-400">({loc.temp})</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Inspected / Received By"
                size="sm"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
              />
              <Input
                label="Inspection / Temperature Notes"
                size="sm"
                placeholder="e.g. Temperature checked: -18°C, seal intact"
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="flat" onClick={onCloseReceive}>
              Cancel
            </Button>
            <Button
              size="sm"
              color="primary"
              onClick={handleSubmitReceive}
              isLoading={isSubmitting}
              className="font-semibold"
            >
              Confirm Receiving
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal isOpen={isAdjustOpen} onOpenChange={onOpenChangeAdjust}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-base font-bold">Adjust Physical Stock</h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {adjustStockItem && (
              <>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                  <p className="font-bold text-neutral-900 dark:text-neutral-100">
                    {adjustStockItem.productName}
                  </p>
                  <p className="text-neutral-500">
                    Warehouse: {adjustStockItem.warehouseName}
                  </p>
                  <p className="text-neutral-500">
                    Current system quantity: <span className="font-bold">{adjustStockItem.quantity} {adjustStockItem.unit}</span>
                  </p>
                </div>

                <Input
                  type="number"
                  label={`New Actual Quantity (${adjustStockItem.unit})`}
                  size="sm"
                  value={adjustQty.toString()}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  required
                />

                <Textarea
                  label="Adjustment Reason"
                  size="sm"
                  placeholder="e.g. Stock opname count discrepancy, spoilage, or kitchen sample"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="flat" onClick={onCloseAdjust}>
              Cancel
            </Button>
            <Button
              size="sm"
              color="primary"
              onClick={handleSubmitAdjust}
              isLoading={isSubmitting}
              className="font-semibold"
            >
              Update Stock
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
