import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { HeroUIProvider } from '@heroui/react';
import { ProductionPage } from '../pages/ProductionPage';
import { Recipe, ProductionOrder, Product, Warehouse } from '../types/erp';

const mockProducts: Product[] = [
  {
    id: 'prod-fg-1',
    code: 'FG-RENDANG-01',
    name: 'Signature Cooked Rendang Base',
    categoryId: 'cat-1',
    categoryName: 'Cooked Foods',
    unit: 'kg',
    purchasePrice: 95000,
    sellingPrice: 150000,
    minStock: 5,
    description: 'Slow-cooked Padang rendang paste base',
    status: 'ACTIVE',
    createdAt: '2026-09-30T10:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z',
  },
  {
    id: 'prod-raw-1',
    code: 'RAW-BEEF-01',
    name: 'Fresh Beef Shank',
    categoryId: 'cat-2',
    categoryName: 'Raw Materials',
    unit: 'kg',
    purchasePrice: 120000,
    sellingPrice: 140000,
    minStock: 10,
    description: 'Fresh local beef shank cut',
    status: 'ACTIVE',
    createdAt: '2026-09-30T10:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z',
  },
];

const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-kitchen-1',
    code: 'WH-KITCHEN-03',
    name: 'Central Commissary Kitchen SCBD',
    address: 'SCBD Lot 8, Jakarta',
    status: 'ACTIVE',
    createdAt: '2026-09-30T10:00:00Z',
  },
];

const mockRecipes: Recipe[] = [
  {
    id: 'rcp-1',
    code: 'RCP-RENDANG-10KG',
    name: 'Signature Rendang 10kg Batch',
    targetProductId: 'prod-fg-1',
    targetProductCode: 'FG-RENDANG-01',
    targetProductName: 'Signature Cooked Rendang Base',
    yieldQuantity: 10,
    unit: 'kg',
    description: 'Standard commissary production recipe',
    status: 'ACTIVE',
    items: [
      {
        id: 'ri-1',
        ingredientProductId: 'prod-raw-1',
        ingredientProductCode: 'RAW-BEEF-01',
        ingredientProductName: 'Fresh Beef Shank',
        quantity: 12,
        unit: 'kg',
      },
    ],
    createdAt: '2026-09-30T10:00:00Z',
  },
];

const mockProductionOrders: ProductionOrder[] = [
  {
    id: 'wo-1',
    orderNumber: 'WO-20261025-001',
    recipeId: 'rcp-1',
    recipeCode: 'RCP-RENDANG-10KG',
    recipeName: 'Signature Rendang 10kg Batch',
    targetProductId: 'prod-fg-1',
    targetProductCode: 'FG-RENDANG-01',
    targetProductName: 'Signature Cooked Rendang Base',
    warehouseId: 'wh-kitchen-1',
    warehouseCode: 'WH-KITCHEN-03',
    warehouseName: 'Central Commissary Kitchen SCBD',
    plannedQuantity: 20,
    actualQuantity: 0,
    status: 'PLANNED',
    createdBy: 'Head Chef Bambang',
    items: [
      {
        id: 'wo-item-1',
        ingredientProductId: 'prod-raw-1',
        ingredientProductCode: 'RAW-BEEF-01',
        ingredientProductName: 'Fresh Beef Shank',
        plannedQuantity: 24,
        actualConsumedQuantity: 0,
        unit: 'kg',
      },
    ],
    createdAt: '2026-10-25T03:00:00Z',
  },
];

describe('Feature: Central Kitchen Production UI Component Tests', () => {
  it('renders production work orders and recipe KPI metrics', () => {
    render(
      <HeroUIProvider>
        <ProductionPage
          recipes={mockRecipes}
          productionOrders={mockProductionOrders}
          products={mockProducts}
          warehouses={mockWarehouses}
          onRefresh={vi.fn()}
        />
      </HeroUIProvider>
    );

    // KPI verification
    expect(screen.getByText('Active Recipes (BOM)')).toBeInTheDocument();
    expect(screen.getByText('Work Orders in Flight')).toBeInTheDocument();
    expect(screen.getByText('SCBD Central Commissary')).toBeInTheDocument();

    // Table verification
    expect(screen.getByText('WO-20261025-001')).toBeInTheDocument();
    expect(screen.getAllByText('PLANNED').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('switches to Recipe & BOM catalog tab when clicked', () => {
    render(
      <HeroUIProvider>
        <ProductionPage
          recipes={mockRecipes}
          productionOrders={mockProductionOrders}
          products={mockProducts}
          warehouses={mockWarehouses}
          onRefresh={vi.fn()}
        />
      </HeroUIProvider>
    );

    const recipeTab = screen.getByText(/Recipe Catalog & BOM/i);
    fireEvent.click(recipeTab);

    expect(screen.getByText('Signature Rendang 10kg Batch')).toBeInTheDocument();
    expect(screen.getByText('RCP-RENDANG-10KG')).toBeInTheDocument();
    expect(screen.getByText('Cook Batch')).toBeInTheDocument();
  });

  it('opens Issue Work Order modal when Issue Work Order button is pressed', () => {
    render(
      <HeroUIProvider>
        <ProductionPage
          recipes={mockRecipes}
          productionOrders={mockProductionOrders}
          products={mockProducts}
          warehouses={mockWarehouses}
          onRefresh={vi.fn()}
        />
      </HeroUIProvider>
    );

    const issueButton = screen.getByText('Issue Work Order');
    fireEvent.click(issueButton);

    expect(screen.getByText(/Issue Central Kitchen Production Work Order/i)).toBeInTheDocument();
  });
});
