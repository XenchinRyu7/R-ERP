import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Boxes,
  ThermometerSnowflake,
  ChefHat,
  BoxSelect,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Select,
  SelectItem,
} from '@heroui/react';
import { Warehouse, InventoryStock } from '../types/erp';
import { erpApi } from '../api/erpApi';
import { WAREHOUSE_PROFILES } from '../utils/warehouseZones';

interface WarehousesPageProps {
  warehouses: Warehouse[];
  stocks: InventoryStock[];
  onRefresh: () => void;
}

export const WarehousesPage: React.FC<WarehousesPageProps> = ({
  warehouses,
  stocks,
  onRefresh,
}) => {
  const [editingWh, setEditingWh] = useState<Warehouse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedWhId, setExpandedWhId] = useState<string | null>(null);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const handleOpenAdd = () => {
    setEditingWh(null);
    setFormData({
      code: `WH-${Math.floor(10 + Math.random() * 90)}`,
      name: '',
      address: '',
      status: 'ACTIVE',
    });
    onOpen();
  };

  const handleOpenEdit = (w: Warehouse) => {
    setEditingWh(w);
    setFormData({
      code: w.code,
      name: w.name,
      address: w.address || '',
      status: w.status,
    });
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      alert('Please fill code and name.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingWh) {
        await erpApi.updateWarehouse(editingWh.id, formData);
      } else {
        await erpApi.createWarehouse(formData);
      }
      onClose();
      onRefresh();
    } catch (err: any) {
      alert('Error saving warehouse: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await erpApi.deleteWarehouse(id);
      onRefresh();
    } catch (err: any) {
      alert('Error deleting warehouse: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">Storage & Hub Facilities</h3>
          <p className="text-xs text-neutral-500">Manage cold storage, dry hubs, and commissary kitchens</p>
        </div>

        <Button
          color="primary"
          size="sm"
          className="font-semibold shadow-md shadow-blue-500/20"
          startContent={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Warehouse
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => {
          const profile = WAREHOUSE_PROFILES[wh.code] || {
            code: wh.code,
            type: wh.code.includes('COLD') ? 'COLD_STORAGE' : wh.code.includes('KITCHEN') ? 'COMMISSARY_KITCHEN' : 'DRY_STORAGE',
            roleBadge: wh.name,
            roleColor: 'default' as const,
            headline: 'Fasilitas Pergudangan Standar F&B',
            inboundSource: 'Supplier & Operasional',
            outboundTarget: 'Distribusi Internal & Eksternal',
            operatingTemp: 'Suhu Terkontrol',
            zones: [
              {
                id: 'ZONE-STD',
                name: 'Zone Utama - Rak & Kotak Standar',
                tempRange: 'Standar',
                description: 'Penyimpanan barang & bahan baku F&B',
                racks: ['Rak A-01', 'Rak A-02'],
                bins: ['Kotak A-01', 'Kotak A-02'],
              },
            ],
          };

          const whStocks = stocks.filter((s) => s.warehouseId === wh.id);
          const totalUnits = whStocks.reduce((sum, s) => sum + Number(s.quantity), 0);
          const lowStockCount = whStocks.filter((s) => s.isLowStock).length;
          const isExpanded = expandedWhId === wh.id;

          const isCold = profile.type === 'COLD_STORAGE';
          const isKitchen = profile.type === 'COMMISSARY_KITCHEN';

          return (
            <Card
              key={wh.id}
              className={`border transition-all shadow-sm hover:shadow-md ${
                isCold
                  ? 'border-blue-200 dark:border-blue-900/60 bg-gradient-to-b from-blue-50/20 to-transparent'
                  : isKitchen
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/20 to-transparent'
                  : 'border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/20 to-transparent'
              } dark:bg-neutral-900`}
            >
              <CardBody className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                        isCold
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'
                          : isKitchen
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {isCold ? (
                        <ThermometerSnowflake className="w-5 h-5" />
                      ) : isKitchen ? (
                        <ChefHat className="w-5 h-5" />
                      ) : (
                        <Boxes className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={profile.roleColor}
                        className="text-[10px] h-5 font-bold uppercase tracking-wider"
                      >
                        {profile.roleBadge}
                      </Chip>
                      <span className="font-mono text-[11px] block text-neutral-400 mt-0.5 font-semibold">
                        {wh.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={wh.status === 'ACTIVE' ? 'success' : 'default'}
                      className="text-[10px] h-5 font-semibold"
                    >
                      {wh.status}
                    </Chip>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => handleOpenEdit(wh)}
                      className="text-neutral-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => handleDelete(wh.id)}
                      className="text-neutral-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                    {wh.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-normal">
                    {profile.headline}
                  </p>
                  <div className="flex items-start gap-1.5 text-xs text-neutral-400 mt-2.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-400" />
                    <span className="line-clamp-2">{wh.address || 'Alamat tidak ditentukan'}</span>
                  </div>
                </div>

                {/* Supply Chain Flow Box */}
                <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1 font-medium">
                      <Layers className="w-3 h-3 text-neutral-400" /> Suhu Operasional:
                    </span>
                    <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                      {profile.operatingTemp}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-neutral-200/40 dark:border-neutral-700/40">
                    <span className="text-neutral-400 shrink-0 font-medium">Inbound:</span>
                    <span className="text-right font-medium text-neutral-700 dark:text-neutral-300">
                      {profile.inboundSource}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-neutral-400 shrink-0 font-medium">Outbound:</span>
                    <span className="text-right font-medium text-blue-600 dark:text-blue-400">
                      {profile.outboundTarget}
                    </span>
                  </div>
                </div>

                {/* Stock Stats */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 uppercase font-semibold">SKU Tersimpan</p>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{whStocks.length} SKU</p>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 uppercase font-semibold">Stok Kritis</p>
                    <p className={`text-sm font-bold mt-0.5 ${lowStockCount > 0 ? 'text-rose-500 font-extrabold' : 'text-neutral-900 dark:text-white'}`}>
                      {lowStockCount} Item
                    </p>
                  </div>
                </div>

                {/* Expandable Zones & Storage Kotak/Bins */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Button
                    size="sm"
                    variant="light"
                    className="w-full justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-300 h-8 px-2"
                    onClick={() => setExpandedWhId(isExpanded ? null : wh.id)}
                    endContent={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  >
                    <span className="flex items-center gap-1.5">
                      <BoxSelect className="w-3.5 h-3.5 text-blue-600" />
                      Detail Zona & Kotak/Rak Penyimpanan ({profile.zones.length} Zona)
                    </span>
                  </Button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2.5 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700 animate-fadeIn">
                      {profile.zones.map((zone) => (
                        <div
                          key={zone.id}
                          className="p-2.5 rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900 dark:text-white text-[11px]">
                              {zone.name}
                            </span>
                            <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300 font-semibold">
                              {zone.tempRange}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 leading-relaxed">
                            {zone.description}
                          </p>

                          <div className="pt-1.5 flex flex-wrap gap-1">
                            <span className="text-[10px] font-semibold text-neutral-400 self-center mr-1">
                              Rak & Kotak:
                            </span>
                            {zone.bins.map((bin) => (
                              <Chip
                                key={bin}
                                size="sm"
                                variant="flat"
                                className="text-[9px] h-4 font-mono px-1 bg-neutral-100 dark:bg-neutral-700/80 text-neutral-700 dark:text-neutral-300"
                              >
                                {bin}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-base font-bold">
              {editingWh ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Facility Code"
              size="sm"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <Input
              label="Facility Name"
              size="sm"
              placeholder="e.g. Cold Storage Hub Barat"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Textarea
              label="Address & Access Instructions"
              size="sm"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Select
              label="Status"
              size="sm"
              selectedKeys={[formData.status]}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <SelectItem key="ACTIVE">ACTIVE</SelectItem>
              <SelectItem key="INACTIVE">INACTIVE</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="flat" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              color="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="font-semibold"
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
