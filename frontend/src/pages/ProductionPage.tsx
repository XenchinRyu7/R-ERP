import React, { useState } from 'react';
import {
  ChefHat,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Clock,
  Boxes,
  ScrollText,
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
  Textarea,
  Tabs,
  Tab
} from '@heroui/react';
import { Recipe, ProductionOrder, Product, Warehouse } from '../types/erp';
import { erpApi } from '../api/erpApi';

interface ProductionPageProps {
  recipes: Recipe[];
  productionOrders: ProductionOrder[];
  products: Product[];
  warehouses: Warehouse[];
  onRefresh: () => void;
}

export const ProductionPage: React.FC<ProductionPageProps> = ({
  recipes,
  productionOrders,
  products,
  warehouses,
  onRefresh,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected order/recipe for view & action
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Modals
  const {
    isOpen: isCreateRecipeOpen,
    onOpen: onOpenCreateRecipe,
    onOpenChange: onOpenChangeCreateRecipe,
    onClose: onCloseCreateRecipe,
  } = useDisclosure();

  const {
    isOpen: isCreateOrderOpen,
    onOpen: onOpenCreateOrder,
    onOpenChange: onOpenChangeCreateOrder,
    onClose: onCloseCreateOrder,
  } = useDisclosure();

  const {
    isOpen: isCompleteOrderOpen,
    onOpen: onOpenCompleteOrder,
    onOpenChange: onOpenChangeCompleteOrder,
    onClose: onCloseCompleteOrder,
  } = useDisclosure();

  const {
    isOpen: isViewOrderOpen,
    onOpen: onOpenViewOrder,
    onOpenChange: onOpenChangeViewOrder,
    onClose: onCloseViewOrder,
  } = useDisclosure();

  // Create Recipe Form State
  const [recipeCode, setRecipeCode] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [targetProductId, setTargetProductId] = useState('');
  const [yieldQuantity, setYieldQuantity] = useState<number>(10);
  const [recipeUnit, setRecipeUnit] = useState('kg');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeItems, setRecipeItems] = useState<
    Array<{ ingredientProductId: string; quantity: number; unit: string; notes?: string }>
  >([]);

  // Create Production Order Form State
  const [orderRecipeId, setOrderRecipeId] = useState('');
  const [orderWarehouseId, setOrderWarehouseId] = useState('');
  const [orderPlannedQty, setOrderPlannedQty] = useState<number>(10);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderCreatedBy, setOrderCreatedBy] = useState('Head Chef Commissary');

  // Complete Order Form State
  const [actualProducedQty, setActualProducedQty] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState('');
  const [consumedItemsState, setConsumedItemsState] = useState<
    Array<{ ingredientProductId: string; productName: string; actualQuantity: number; unit: string }>
  >([]);

  // Filtered Orders
  const filteredOrders = productionOrders.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.recipeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.targetProductName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Recipes
  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.targetProductName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status Chip Color Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'primary';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Handlers for Recipe
  const handleOpenCreateRecipe = () => {
    setRecipeCode(`RCP-${Date.now().toString().slice(-6)}`);
    setRecipeName('');
    const firstProduct = products[0];
    setTargetProductId(firstProduct?.id || '');
    setYieldQuantity(10);
    setRecipeUnit(firstProduct?.unit || 'kg');
    setRecipeDescription('');
    if (products.length > 1) {
      setRecipeItems([
        { ingredientProductId: products[1].id, quantity: 5, unit: products[1].unit || 'kg', notes: '' },
      ]);
    } else {
      setRecipeItems([]);
    }
    onOpenCreateRecipe();
  };

  const handleAddRecipeItem = () => {
    if (products.length === 0) return;
    setRecipeItems([
      ...recipeItems,
      { ingredientProductId: products[0].id, quantity: 1, unit: products[0].unit || 'kg', notes: '' },
    ]);
  };

  const handleRemoveRecipeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleSubmitCreateRecipe = async () => {
    if (!recipeName || !targetProductId || yieldQuantity <= 0 || recipeItems.length === 0) {
      alert('Please fill recipe name, target product, valid yield, and at least 1 ingredient.');
      return;
    }
    setIsSubmitting(true);
    try {
      await erpApi.createRecipe({
        code: recipeCode,
        name: recipeName,
        targetProductId,
        yieldQuantity,
        unit: recipeUnit,
        description: recipeDescription,
        items: recipeItems,
      });
      onCloseCreateRecipe();
      onRefresh();
    } catch (err: any) {
      alert(`Error creating recipe: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Production Order
  const handleOpenCreateOrder = () => {
    const defaultRecipe = recipes[0];
    const kitchenWh = warehouses.find((w) => w.code.includes('KITCHEN')) || warehouses[0];
    setOrderRecipeId(defaultRecipe?.id || '');
    setOrderWarehouseId(kitchenWh?.id || '');
    setOrderPlannedQty(defaultRecipe ? Number(defaultRecipe.yieldQuantity) : 10);
    setOrderNotes('');
    setOrderCreatedBy('Head Chef Commissary');
    onOpenCreateOrder();
  };

  const handleSubmitCreateOrder = async () => {
    if (!orderRecipeId || !orderWarehouseId || orderPlannedQty <= 0) {
      alert('Please select recipe, kitchen warehouse, and valid planned quantity.');
      return;
    }
    setIsSubmitting(true);
    try {
      await erpApi.createProductionOrder({
        recipeId: orderRecipeId,
        warehouseId: orderWarehouseId,
        plannedQuantity: orderPlannedQty,
        notes: orderNotes,
        createdBy: orderCreatedBy,
      });
      onCloseCreateOrder();
      onRefresh();
    } catch (err: any) {
      alert(`Error issuing work order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOrder = async (orderId: string) => {
    if (!confirm('Start production batch? Status will move to IN_PROGRESS.')) return;
    try {
      await erpApi.startProductionOrder(orderId);
      onRefresh();
    } catch (err: any) {
      alert(`Error starting order: ${err.message}`);
    }
  };

  const handleOpenCompleteOrder = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setActualProducedQty(order.plannedQuantity);
    setCompletionNotes('');
    setConsumedItemsState(
      order.items.map((item) => ({
        ingredientProductId: item.ingredientProductId,
        productName: item.ingredientProductName || 'Ingredient',
        actualQuantity: item.plannedQuantity,
        unit: item.unit,
      }))
    );
    onOpenCompleteOrder();
  };

  const handleSubmitCompleteOrder = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      await erpApi.completeProductionOrder(selectedOrder.id, {
        actualProducedQuantity: actualProducedQty,
        consumedItems: consumedItemsState.map((ci) => ({
          ingredientProductId: ci.ingredientProductId,
          actualQuantity: ci.actualQuantity,
        })),
        notes: completionNotes,
      });
      onCloseCompleteOrder();
      onRefresh();
    } catch (err: any) {
      alert(`Error completing order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (reason === null) return;
    try {
      await erpApi.cancelProductionOrder(orderId, reason);
      onRefresh();
    } catch (err: any) {
      alert(`Error cancelling order: ${err.message}`);
    }
  };

  const handleViewOrder = (order: ProductionOrder) => {
    setSelectedOrder(order);
    onOpenViewOrder();
  };

  // Recipe scaling preview for Work Order Creation
  const activeOrderRecipe = recipes.find((r) => r.id === orderRecipeId);
  const scalingFactor =
    activeOrderRecipe && activeOrderRecipe.yieldQuantity > 0
      ? orderPlannedQty / activeOrderRecipe.yieldQuantity
      : 1;

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active Recipes (BOM)</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <ScrollText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">{recipes.length}</p>
          <span className="text-xs text-neutral-400 mt-1 block">Standardized commissary formulas</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Work Orders in Flight</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
            {productionOrders.filter((o) => o.status === 'PLANNED' || o.status === 'IN_PROGRESS').length}
          </p>
          <span className="text-xs text-amber-600 font-medium mt-1 block">Planned & cooking batches</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Completed Batches</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
            {productionOrders.filter((o) => o.status === 'COMPLETED').length}
          </p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Stock credited to inventory</span>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Production Hub</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-900 dark:text-white mt-2 truncate">SCBD Central Commissary</p>
          <span className="text-xs text-purple-600 font-medium mt-1 block">Yield auto-conversion active</span>
        </div>
      </div>

      {/* Tabs & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          color="primary"
          variant="solid"
          radius="lg"
        >
          <Tab
            key="orders"
            title={
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                <span>Production Work Orders ({productionOrders.length})</span>
              </div>
            }
          />
          <Tab
            key="recipes"
            title={
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4" />
                <span>Recipe Catalog & BOM ({recipes.length})</span>
              </div>
            }
          />
        </Tabs>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            size="sm"
            placeholder="Search code, recipe or product..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="w-full sm:w-64"
          />

          {selectedTab === 'orders' ? (
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleOpenCreateOrder}
              className="font-semibold shadow-sm shrink-0"
              isDisabled={recipes.length === 0}
            >
              Issue Work Order
            </Button>
          ) : (
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleOpenCreateRecipe}
              className="font-semibold shadow-sm shrink-0"
            >
              New Recipe (BOM)
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: WORK ORDERS */}
      {selectedTab === 'orders' && (
        <div className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'solid' : 'flat'}
                color={statusFilter === st ? 'primary' : 'default'}
                onPress={() => setStatusFilter(st)}
                className="text-xs font-semibold rounded-xl"
              >
                {st.replace('_', ' ')}
              </Button>
            ))}
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
            <Table aria-label="Production Work Orders Table" removeWrapper>
              <TableHeader>
                <TableColumn>ORDER #</TableColumn>
                <TableColumn>RECIPE & FINISHED PRODUCT</TableColumn>
                <TableColumn>FACILITY / KITCHEN</TableColumn>
                <TableColumn>PLANNED / ACTUAL</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>SCHEDULE</TableColumn>
                <TableColumn align="center">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No production work orders found matching criteria.">
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                    <TableCell>
                      <div className="font-semibold text-neutral-900 dark:text-white">{order.orderNumber}</div>
                      <span className="text-[11px] text-neutral-400">{order.createdBy || 'Kitchen Team'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-neutral-900 dark:text-white">{order.targetProductName}</div>
                      <div className="text-xs text-neutral-400">
                        Formula: <span className="text-blue-600 dark:text-blue-400">{order.recipeName}</span> ({order.recipeCode})
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-neutral-800 dark:text-neutral-200">{order.warehouseName}</div>
                      <span className="text-xs text-neutral-400">{order.warehouseCode}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {order.plannedQuantity}{' '}
                        {order.status === 'COMPLETED' ? (
                          <span className="text-emerald-600 font-bold">→ {order.actualQuantity}</span>
                        ) : null}
                      </div>
                      <span className="text-[11px] text-neutral-400">{order.items.length} ingredients scaled</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color={getStatusColor(order.status)} className="font-bold text-xs uppercase">
                        {order.status.replace('_', ' ')}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {order.completedDate ? (
                          <span className="text-emerald-600 font-medium">Done: {new Date(order.completedDate).toLocaleDateString()}</span>
                        ) : order.startDate ? (
                          <span className="text-amber-600 font-medium">Started: {new Date(order.startDate).toLocaleDateString()}</span>
                        ) : (
                          <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleViewOrder(order)}
                          title="View Order Details & BOM breakdown"
                        >
                          <Eye className="w-4 h-4 text-neutral-600" />
                        </Button>

                        {order.status === 'PLANNED' && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Play className="w-3.5 h-3.5" />}
                            onPress={() => handleStartOrder(order.id)}
                            className="font-semibold text-xs h-8"
                          >
                            Start
                          </Button>
                        )}

                        {(order.status === 'IN_PROGRESS' || order.status === 'PLANNED') && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="success"
                            startContent={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onPress={() => handleOpenCompleteOrder(order)}
                            className="font-semibold text-xs h-8"
                          >
                            Complete
                          </Button>
                        )}

                        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleCancelOrder(order.id)}
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 2: RECIPES & BOM */}
      {selectedTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">{recipe.code}</span>
                  <Chip size="sm" variant="flat" color="success" className="text-[10px] font-bold">
                    {recipe.status}
                  </Chip>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{recipe.name}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Output: <strong className="text-neutral-800 dark:text-neutral-200">{recipe.targetProductName}</strong>
                </p>
                <div className="mt-3 flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">
                    Standard Batch Yield: <strong>{recipe.yieldQuantity} {recipe.unit}</strong>
                  </span>
                </div>

                {recipe.description && (
                  <p className="text-xs text-neutral-500 mt-3 line-clamp-2 italic">{recipe.description}</p>
                )}

                {/* Recipe Items Preview */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    BOM Ingredients ({recipe.items.length})
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {recipe.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-neutral-100/50 dark:bg-neutral-800/40"
                      >
                        <span className="truncate max-w-[180px] font-medium text-neutral-700 dark:text-neutral-300">
                          {item.ingredientProductName || item.ingredientProductCode}
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Play className="w-3.5 h-3.5" />}
                  onPress={() => {
                    setOrderRecipeId(recipe.id);
                    setOrderPlannedQty(recipe.yieldQuantity);
                    setSelectedTab('orders');
                    onOpenCreateOrder();
                  }}
                  className="font-semibold text-xs"
                >
                  Cook Batch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: CREATE RECIPE (BOM) */}
      <Modal isOpen={isCreateRecipeOpen} onOpenChange={onOpenChangeCreateRecipe} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-blue-600" />
              Define New Commissary Recipe (Bill of Materials)
            </h2>
            <p className="text-xs text-neutral-500 font-normal">
              Specify standard batch output and exact ingredient ratios for automated production scaling.
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Recipe Code"
                value={recipeCode}
                onValueChange={setRecipeCode}
                placeholder="e.g. RCP-RENDANG-01"
                isRequired
              />
              <Input
                label="Recipe Name"
                value={recipeName}
                onValueChange={setRecipeName}
                placeholder="e.g. Signature Rendang Padang 10kg Batch"
                isRequired
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Target Finished Product"
                selectedKeys={targetProductId ? [targetProductId] : []}
                onChange={(e) => setTargetProductId(e.target.value)}
                isRequired
              >
                {products.map((p) => (
                  <SelectItem key={p.id} textValue={`${p.name} (${p.code})`}>
                    {p.name} ({p.code})
                  </SelectItem>
                ))}
              </Select>
              <Input
                type="number"
                label="Yield Quantity"
                value={yieldQuantity.toString()}
                onValueChange={(val) => setYieldQuantity(Number(val) || 0)}
                isRequired
              />
              <Input
                label="Yield Unit"
                value={recipeUnit}
                onValueChange={setRecipeUnit}
                placeholder="kg, portion, pack..."
                isRequired
              />
            </div>

            <Textarea
              label="Standard Operating Procedure / Cooking Notes"
              value={recipeDescription}
              onValueChange={setRecipeDescription}
              placeholder="e.g. Simmer at 95°C for 4 hours until reduction is complete..."
              rows={2}
            />

            {/* Ingredients Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Required Ingredients (BOM)
                </h4>
                <Button size="sm" variant="flat" color="primary" onPress={handleAddRecipeItem} startContent={<Plus className="w-3.5 h-3.5" />}>
                  Add Ingredient
                </Button>
              </div>

              {recipeItems.length === 0 ? (
                <div className="p-4 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-center text-xs text-neutral-400">
                  No ingredients added yet. Click &quot;Add Ingredient&quot; above.
                </div>
              ) : (
                <div className="space-y-3">
                  {recipeItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-xl"
                    >
                      <div className="col-span-5">
                        <Select
                          size="sm"
                          label="Ingredient"
                          selectedKeys={item.ingredientProductId ? [item.ingredientProductId] : []}
                          onChange={(e) => {
                            const newProdId = e.target.value;
                            const found = products.find((p) => p.id === newProdId);
                            const updated = [...recipeItems];
                            updated[index] = {
                              ...updated[index],
                              ingredientProductId: newProdId,
                              unit: found?.unit || updated[index].unit,
                            };
                            setRecipeItems(updated);
                          }}
                        >
                          {products.map((p) => (
                            <SelectItem key={p.id} textValue={p.name}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <Input
                          size="sm"
                          type="number"
                          label="Quantity"
                          value={item.quantity.toString()}
                          onValueChange={(val) => {
                            const updated = [...recipeItems];
                            updated[index] = { ...updated[index], quantity: Number(val) || 0 };
                            setRecipeItems(updated);
                          }}
                        />
                      </div>

                      <div className="col-span-3">
                        <Input
                          size="sm"
                          label="Unit"
                          value={item.unit}
                          onValueChange={(val) => {
                            const updated = [...recipeItems];
                            updated[index] = { ...updated[index], unit: val };
                            setRecipeItems(updated);
                          }}
                        />
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleRemoveRecipeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseCreateRecipe}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmitCreateRecipe} isLoading={isSubmitting}>
              Save Recipe BOM
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL 2: ISSUE PRODUCTION WORK ORDER */}
      <Modal isOpen={isCreateOrderOpen} onOpenChange={onOpenChangeCreateOrder} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-500" />
              Issue Central Kitchen Production Work Order (SPK)
            </h2>
            <p className="text-xs text-neutral-500 font-normal">
              Authorize commissary kitchen to manufacture product batch according to standard BOM.
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Recipe (BOM)"
                selectedKeys={orderRecipeId ? [orderRecipeId] : []}
                onChange={(e) => {
                  const rId = e.target.value;
                  setOrderRecipeId(rId);
                  const found = recipes.find((r) => r.id === rId);
                  if (found) setOrderPlannedQty(found.yieldQuantity);
                }}
                isRequired
              >
                {recipes.map((r) => (
                  <SelectItem key={r.id} textValue={`${r.name} (${r.code})`}>
                    {r.name} ({r.code})
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Kitchen Facility / Warehouse"
                selectedKeys={orderWarehouseId ? [orderWarehouseId] : []}
                onChange={(e) => setOrderWarehouseId(e.target.value)}
                isRequired
              >
                {warehouses.map((w) => (
                  <SelectItem key={w.id} textValue={`${w.name} (${w.code})`}>
                    {w.name} ({w.code})
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Planned Output Quantity"
                value={orderPlannedQty.toString()}
                onValueChange={(val) => setOrderPlannedQty(Number(val) || 0)}
                isRequired
              />
              <Input
                label="Supervisor / Created By"
                value={orderCreatedBy}
                onValueChange={setOrderCreatedBy}
              />
            </div>

            <Textarea
              label="Work Order Instructions"
              value={orderNotes}
              onValueChange={setOrderNotes}
              placeholder="e.g. Priority batch for weekend delivery to Branch SCBD & Menteng"
              rows={2}
            />

            {/* Scaled Ingredients Preview */}
            {activeOrderRecipe && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Scaled Ingredients Requirement (x{scalingFactor.toFixed(2)})
                  </span>
                  <span className="text-xs text-blue-600 font-semibold">
                    Target: {orderPlannedQty} {activeOrderRecipe.unit} of {activeOrderRecipe.targetProductName}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeOrderRecipe.items.map((item, i) => {
                    const scaledQty = Number((item.quantity * scalingFactor).toFixed(2));
                    return (
                      <div key={i} className="flex items-center justify-between text-xs py-1 px-2 bg-white dark:bg-neutral-900 rounded-lg">
                        <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                          {item.ingredientProductName || item.ingredientProductCode}
                        </span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {scaledQty} {item.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseCreateOrder}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmitCreateOrder} isLoading={isSubmitting}>
              Issue Work Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL 3: COMPLETE PRODUCTION ORDER */}
      <Modal isOpen={isCompleteOrderOpen} onOpenChange={onOpenChangeCompleteOrder} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Complete Production Work Order ({selectedOrder?.orderNumber})
            </h2>
            <p className="text-xs text-neutral-500 font-normal">
              Confirm actual output produced and finalize raw material consumptions. Stock will be automatically updated!
            </p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
              <Boxes className="w-5 h-5 text-emerald-600" />
              <div className="text-xs text-emerald-800 dark:text-emerald-300">
                <strong>Target Product:</strong> {selectedOrder?.targetProductName} ({selectedOrder?.plannedQuantity} planned)
              </div>
            </div>

            <Input
              type="number"
              label="Actual Produced Quantity (Credit to Stock)"
              value={actualProducedQty.toString()}
              onValueChange={(val) => setActualProducedQty(Number(val) || 0)}
              isRequired
            />

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Actual Ingredients Consumed (Deduct from Stock)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {consumedItemsState.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-3 items-center p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/60"
                  >
                    <div className="col-span-7">
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{item.productName}</span>
                    </div>
                    <div className="col-span-5 flex items-center gap-2">
                      <Input
                        size="sm"
                        type="number"
                        value={item.actualQuantity.toString()}
                        onValueChange={(val) => {
                          const updated = [...consumedItemsState];
                          updated[idx] = { ...updated[idx], actualQuantity: Number(val) || 0 };
                          setConsumedItemsState(updated);
                        }}
                        endContent={<span className="text-xs text-neutral-400">{item.unit}</span>}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Textarea
              label="Kitchen Completion Notes / Yield Variance"
              value={completionNotes}
              onValueChange={setCompletionNotes}
              placeholder="e.g. Yield matched target exactly. Zero shrinkage during cooking."
              rows={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseCompleteOrder}>
              Cancel
            </Button>
            <Button color="success" onPress={handleSubmitCompleteOrder} isLoading={isSubmitting} className="text-white font-semibold">
              Finalize & Update Inventory
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL 4: VIEW WORK ORDER DETAILS */}
      <Modal isOpen={isViewOrderOpen} onOpenChange={onOpenChangeViewOrder} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Work Order Details: {selectedOrder?.orderNumber}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Chip size="sm" variant="flat" color={getStatusColor(selectedOrder?.status || 'PLANNED')} className="text-xs uppercase font-bold">
                {selectedOrder?.status}
              </Chip>
              <span className="text-xs text-neutral-400">Created {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString() : ''}</span>
            </div>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-xs">
              <div>
                <span className="text-neutral-400 block mb-0.5">Finished Product</span>
                <strong className="text-neutral-900 dark:text-white text-sm">{selectedOrder?.targetProductName}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5">Facility / Warehouse</span>
                <strong className="text-neutral-900 dark:text-white text-sm">{selectedOrder?.warehouseName}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5">Planned Output</span>
                <strong className="text-neutral-900 dark:text-white">{selectedOrder?.plannedQuantity} units</strong>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5">Actual Completed Output</span>
                <strong className="text-emerald-600 font-bold">{selectedOrder?.actualQuantity || 0} units</strong>
              </div>
            </div>

            {selectedOrder?.notes && (
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-600 dark:text-neutral-400">
                <strong>Notes:</strong> {selectedOrder.notes}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Ingredients Consumption Breakdown
              </h4>
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <Table aria-label="Order items breakdown" removeWrapper>
                  <TableHeader>
                    <TableColumn>INGREDIENT</TableColumn>
                    <TableColumn>PLANNED</TableColumn>
                    <TableColumn>ACTUAL CONSUMED</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(selectedOrder?.items || []).map((it) => (
                      <TableRow key={it.id || it.ingredientProductId}>
                        <TableCell>
                          <div className="font-semibold text-neutral-900 dark:text-white">{it.ingredientProductName}</div>
                          <span className="text-xs text-neutral-400">{it.ingredientProductCode}</span>
                        </TableCell>
                        <TableCell>{it.plannedQuantity} {it.unit}</TableCell>
                        <TableCell>
                          <span className={it.actualConsumedQuantity > 0 ? 'text-emerald-600 font-bold' : 'text-neutral-400'}>
                            {it.actualConsumedQuantity} {it.unit}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onCloseViewOrder}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
