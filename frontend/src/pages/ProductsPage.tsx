import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2
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
import { Product, ProductCategory, AuthUser } from '../types/erp';
import { erpApi } from '../api/erpApi';

interface ProductsPageProps {
  products: Product[];
  categories: ProductCategory[];
  onRefresh: () => void;
  currentUser?: AuthUser | null;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories,
  onRefresh,
  currentUser,
}) => {
  const isMitra = currentUser?.role === 'MITRA_OUTLET';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    unit: 'KG',
    purchasePrice: 0,
    sellingPrice: 0,
    minStock: 10,
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      code: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      categoryId: categories[0]?.id || '',
      unit: 'KG',
      purchasePrice: 0,
      sellingPrice: 0,
      minStock: 10,
      description: '',
      status: 'ACTIVE',
    });
    onOpen();
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      name: p.name,
      categoryId: p.categoryId,
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      minStock: p.minStock,
      description: p.description || '',
      status: p.status,
    });
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId) {
      alert('Please fill product name and category.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await erpApi.updateProduct(editingProduct.id, formData);
      } else {
        await erpApi.createProduct(formData);
      }
      onClose();
      onRefresh();
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await erpApi.deleteProduct(id);
      onRefresh();
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, selectedCategory]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Input
            placeholder="Search by code or product name..."
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<Search className="w-4 h-4 text-neutral-400" />}
            isClearable
            onClear={() => setSearch('')}
            className="w-full"
          />

          <Select
            size="sm"
            label="Category"
            className="w-44"
            selectedKeys={[selectedCategory]}
            onChange={(e) => setSelectedCategory(e.target.value || 'all')}
          >
            {[
              { id: 'all', name: 'All Categories' },
              ...categories,
            ].map((c) => (
              <SelectItem key={c.id}>{c.name}</SelectItem>
            ))}
          </Select>
        </div>

        {!isMitra && (
          <Button
            color="primary"
            size="sm"
            className="font-semibold shadow-md shadow-blue-500/20"
            startContent={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add New Product
          </Button>
        )}
      </div>

      {/* HeroUI Products Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <Table aria-label="Products Table" shadow="none">
          <TableHeader>
            <TableColumn>CODE</TableColumn>
            <TableColumn>PRODUCT NAME</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>UNIT</TableColumn>
            {!isMitra ? <TableColumn>PURCHASE PRICE</TableColumn> : <TableColumn className="hidden">HIDDEN</TableColumn>}
            <TableColumn>{isMitra ? 'HARGA PASOKAN (IDR)' : 'SELLING PRICE'}</TableColumn>
            <TableColumn>MIN STOCK</TableColumn>
            <TableColumn>STATUS</TableColumn>
            {!isMitra ? <TableColumn className="text-right">ACTIONS</TableColumn> : <TableColumn className="hidden">HIDDEN</TableColumn>}
          </TableHeader>
          <TableBody emptyContent="No products found matching criteria.">
            {filteredProducts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                    {p.code}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 block">{p.name}</span>
                    {p.description && (
                      <span className="text-[11px] text-neutral-400 line-clamp-1">{p.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">
                    {p.categoryName || categories.find((c) => c.id === p.categoryId)?.name || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" className="text-[10px] h-5 font-bold uppercase">
                    {p.unit}
                  </Chip>
                </TableCell>
                {!isMitra ? (
                  <TableCell className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {formatIDR(p.purchasePrice)}
                  </TableCell>
                ) : (
                  <TableCell className="hidden">-</TableCell>
                )}
                <TableCell className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {formatIDR(p.sellingPrice)}
                </TableCell>
                <TableCell className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {p.minStock} {p.unit}
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={p.status === 'ACTIVE' ? 'success' : 'default'}
                    className="text-[10px] h-5 font-semibold"
                  >
                    {p.status}
                  </Chip>
                </TableCell>
                {!isMitra ? (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => handleOpenEdit(p)}
                        className="text-neutral-500 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => handleDelete(p.id)}
                        className="text-neutral-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                ) : (
                  <TableCell className="hidden">-</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-base font-bold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs font-normal text-neutral-500">
              Configure product details, category, pricing, and safety stock threshold.
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Code"
                size="sm"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
              <Input
                label="Product Name"
                size="sm"
                placeholder="e.g. Norwegian Salmon Sashimi Grade"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                size="sm"
                selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <SelectItem key={c.id}>{c.name}</SelectItem>
                ))}
              </Select>

              <Select
                label="Unit of Measurement"
                size="sm"
                selectedKeys={[formData.unit]}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <SelectItem key="KG">KG (Kilogram)</SelectItem>
                <SelectItem key="GRAM">GRAM (Gram)</SelectItem>
                <SelectItem key="LITER">LITER (Liter)</SelectItem>
                <SelectItem key="PCS">PCS (Pieces)</SelectItem>
                <SelectItem key="PACK">PACK (Package)</SelectItem>
                <SelectItem key="BOX">BOX (Carton)</SelectItem>
                <SelectItem key="BOTTLE">BOTTLE</SelectItem>
                <SelectItem key="BAG">BAG (Karung)</SelectItem>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Purchase Price (IDR)"
                size="sm"
                value={formData.purchasePrice.toString()}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
              />
              <Input
                type="number"
                label="Selling Price (IDR)"
                size="sm"
                value={formData.sellingPrice.toString()}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
              />
              <Input
                type="number"
                label="Min Safety Stock"
                size="sm"
                value={formData.minStock.toString()}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>

            <Textarea
              label="Description / Specifications"
              size="sm"
              placeholder="Detailed specifications, storage temp requirements, supplier notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
