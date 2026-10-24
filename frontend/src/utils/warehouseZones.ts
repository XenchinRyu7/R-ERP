export interface WarehouseZone {
  id: string;
  name: string;
  tempRange: string;
  description: string;
  racks: string[];
  bins: string[];
}

export interface WarehouseProfile {
  code: string;
  type: 'COLD_STORAGE' | 'DRY_STORAGE' | 'COMMISSARY_KITCHEN';
  roleBadge: string;
  roleColor: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  headline: string;
  inboundSource: string;
  outboundTarget: string;
  operatingTemp: string;
  zones: WarehouseZone[];
}

export const WAREHOUSE_PROFILES: Record<string, WarehouseProfile> = {
  'WH-COLD-01': {
    code: 'WH-COLD-01',
    type: 'COLD_STORAGE',
    roleBadge: 'Central Cold Storage',
    roleColor: 'primary',
    headline: 'Gudang Bahan Mentah Dingin & Beku (Inbound Supplier Daging/Seafood/Dairy)',
    inboundSource: 'Supplier Bahan Baku (PT Boga Prima, CV Samudera)',
    outboundTarget: 'Transfer Bahan Baku ke Central Commissary Kitchen (WH-KITCHEN-03)',
    operatingTemp: '-20°C s/d 4°C',
    zones: [
      {
        id: 'ZONE-A',
        name: 'Zone A - Deep Freezer Chamber (-18°C s/d -20°C)',
        tempRange: '-18°C ~ -20°C',
        description: 'Penyimpanan beku daging sapi wagyu, fillet ayam, dan seafood premium',
        racks: ['Rak FZ-01', 'Rak FZ-02', 'Rak FZ-03'],
        bins: ['Kotak FZ-A01', 'Kotak FZ-A04', 'Kotak FZ-B10', 'Kotak FZ-B12'],
      },
      {
        id: 'ZONE-B',
        name: 'Zone B - Sub-Zero Seafood Chamber (-20°C)',
        tempRange: '-20°C',
        description: 'Penyimpanan khusus Salmon Trout dan Tiger Prawns segar beku',
        racks: ['Rak SF-01', 'Rak SF-02'],
        bins: ['Kotak SF-A02', 'Kotak SF-B05', 'Kotak SF-B08'],
      },
      {
        id: 'ZONE-C',
        name: 'Zone C - Chilled Dairy & Cheese Chamber (2°C s/d 4°C)',
        tempRange: '+2°C ~ +4°C',
        description: 'Penyimpanan produk susu olahan, premium mozzarella, dan keju',
        racks: ['Rak CH-01', 'Rak CH-02'],
        bins: ['Kotak CH-C01', 'Kotak CH-C08', 'Kotak CH-C12'],
      },
    ],
  },
  'WH-DRY-02': {
    code: 'WH-DRY-02',
    type: 'DRY_STORAGE',
    roleBadge: 'Central Dry Distribution Hub',
    roleColor: 'warning',
    headline: 'Gudang Bahan Baku Kering & Packaging (Inbound Supplier Beras/Bumbu/Box)',
    inboundSource: 'Supplier Bahan Kering & Packaging (PT Sukses Kemasan)',
    outboundTarget: 'Supply Beras/Box ke Dapur Sentral & Mitra Resto',
    operatingTemp: '20°C s/d 25°C (Ambient AC)',
    zones: [
      {
        id: 'ZONE-A',
        name: 'Zone A - Grain & Heavy Pallet Racks',
        tempRange: '22°C ~ 25°C',
        description: 'Penyimpanan beras jasmine, tepung, gula, dan bahan karung/pallet',
        racks: ['Pallet PLT-01', 'Pallet PLT-02', 'Pallet PLT-03'],
        bins: ['Kotak PL-R01', 'Kotak PL-R04', 'Kotak PL-R12'],
      },
      {
        id: 'ZONE-B',
        name: 'Zone B - Temperature Controlled Seasoning Shelf',
        tempRange: '20°C ~ 22°C',
        description: 'Penyimpanan White Truffle Oil, rempah kering, dan bumbu impor',
        racks: ['Rak SH-01', 'Rak SH-02', 'Rak SH-04'],
        bins: ['Kotak SH-T02', 'Kotak SH-T06', 'Kotak SH-T10'],
      },
      {
        id: 'ZONE-C',
        name: 'Zone C - Eco Packaging & Supplies Aisle',
        tempRange: '24°C',
        description: 'Penyimpanan Kraft Lunch Box, paper bag, dan sanitasi resto',
        racks: ['Rak PKG-01', 'Rak PKG-02'],
        bins: ['Kotak BX-01', 'Kotak BX-05', 'Kotak BX-15'],
      },
    ],
  },
  'WH-KITCHEN-03': {
    code: 'WH-KITCHEN-03',
    type: 'COMMISSARY_KITCHEN',
    roleBadge: 'Central Commissary Kitchen',
    roleColor: 'success',
    headline: 'Dapur Sentral & Produksi Bahan Siap Masak (Fulfillment Utama Mitra Resto)',
    inboundSource: 'Transfer Internal dari Cold WH (01) & Dry WH (02)',
    outboundTarget: 'Fulfillment Pesanan Restock Mitra Restoran (Ready-to-Cook)',
    operatingTemp: '16°C s/d 18°C (Hygienic Prep)',
    zones: [
      {
        id: 'ZONE-A',
        name: 'Zone A - Fresh Ingredient & Vegetable Prep',
        tempRange: '12°C ~ 15°C',
        description: 'Sortir sayuran segar organik (Iceberg lettuce, King oyster mushroom)',
        racks: ['Rak PREP-01', 'Rak PREP-02'],
        bins: ['Kotak PR-03', 'Kotak PR-07', 'Kotak PR-10'],
      },
      {
        id: 'ZONE-B',
        name: 'Zone B - Cooked & Marinated Batch Kitchen',
        tempRange: '18°C',
        description: 'Pengolahan daging marinasi, saus racikan sentral, dan vacuum pack',
        racks: ['Station CK-01', 'Station CK-02'],
        bins: ['Kotak M-01', 'Kotak M-05', 'Kotak M-08'],
      },
      {
        id: 'ZONE-C',
        name: 'Zone C - Mitra Dispatch & Staging Bay',
        tempRange: '16°C',
        description: 'Area packaging pesanan cabang mitra resto siap dijemput/diantar armada',
        racks: ['Dispatch DSP-01', 'Dispatch DSP-02'],
        bins: ['Kotak OUT-01', 'Kotak OUT-05', 'Kotak OUT-12'],
      },
    ],
  },
};

/**
 * Returns storage location info (Zone, Rak, Kotak/Bin) for any product
 */
export function getProductStorageLocation(
  productCode?: string,
  categoryName?: string,
  warehouseCode?: string
): {
  zone: string;
  rack: string;
  bin: string;
  fullLocation: string;
  temp: string;
} {
  const code = (productCode || '').toUpperCase();
  const wh = (warehouseCode || '').toUpperCase();
  const cat = (categoryName || '').toLowerCase();

  // Known specific catalog items
  if (code.includes('WAGYU')) {
    return {
      zone: 'Zone A (Deep Freezer -18°C)',
      rack: 'Rak FZ-01',
      bin: 'Kotak FZ-A04',
      fullLocation: 'Zone A • Rak FZ-01 [Kotak FZ-A04]',
      temp: '-18°C',
    };
  }
  if (code.includes('CHICKEN') || code.includes('AYAM')) {
    return {
      zone: 'Zone A (Deep Freezer -18°C)',
      rack: 'Rak FZ-02',
      bin: 'Kotak FZ-B10',
      fullLocation: 'Zone A • Rak FZ-02 [Kotak FZ-B10]',
      temp: '-18°C',
    };
  }
  if (code.includes('SALMON')) {
    return {
      zone: 'Zone B (Seafood Sub-Zero -20°C)',
      rack: 'Rak SF-01',
      bin: 'Kotak SF-A02',
      fullLocation: 'Zone B • Rak SF-01 [Kotak SF-A02]',
      temp: '-20°C',
    };
  }
  if (code.includes('PRAWN') || code.includes('UDANG')) {
    return {
      zone: 'Zone B (Seafood Sub-Zero -20°C)',
      rack: 'Rak SF-02',
      bin: 'Kotak SF-B05',
      fullLocation: 'Zone B • Rak SF-02 [Kotak SF-B05]',
      temp: '-20°C',
    };
  }
  if (code.includes('LETTUCE') || code.includes('SAYUR')) {
    return {
      zone: 'Zone A (Fresh Prep Chamber)',
      rack: 'Rak PREP-01',
      bin: 'Kotak PR-03',
      fullLocation: 'Zone A • Rak PREP-01 [Kotak PR-03]',
      temp: '12°C ~ 15°C',
    };
  }
  if (code.includes('MUSHROOM') || code.includes('JAMUR')) {
    return {
      zone: 'Zone A (Fresh Prep Chamber)',
      rack: 'Rak PREP-02',
      bin: 'Kotak PR-07',
      fullLocation: 'Zone A • Rak PREP-02 [Kotak PR-07]',
      temp: '12°C ~ 15°C',
    };
  }
  if (code.includes('CHEESE') || code.includes('KEJU') || code.includes('DAIRY')) {
    return {
      zone: 'Zone C (Dairy Chiller 2-4°C)',
      rack: 'Rak CH-01',
      bin: 'Kotak CH-C08',
      fullLocation: 'Zone C • Rak CH-01 [Kotak CH-C08]',
      temp: '2°C ~ 4°C',
    };
  }
  if (code.includes('RICE') || code.includes('BERAS')) {
    return {
      zone: 'Zone A (Grain Pallet Aisle)',
      rack: 'Pallet PLT-03',
      bin: 'Kotak PL-R01',
      fullLocation: 'Zone A • Pallet PLT-03 [Kotak PL-R01]',
      temp: '22°C ~ 25°C',
    };
  }
  if (code.includes('TRUFFLE') || code.includes('OIL') || code.includes('MINYAK')) {
    return {
      zone: 'Zone B (Seasoning Shelf)',
      rack: 'Rak SH-04',
      bin: 'Kotak SH-T02',
      fullLocation: 'Zone B • Rak SH-04 [Kotak SH-T02]',
      temp: '20°C ~ 22°C',
    };
  }
  if (code.includes('BOX') || code.includes('KEMASAN') || code.includes('PACK')) {
    return {
      zone: 'Zone C (Eco Packaging Aisle)',
      rack: 'Rak PKG-02',
      bin: 'Kotak BX-05',
      fullLocation: 'Zone C • Rak PKG-02 [Kotak BX-05]',
      temp: '24°C',
    };
  }

  // Fallback category heuristic
  if (wh.includes('COLD') || cat.includes('meat') || cat.includes('seafood') || cat.includes('dairy') || cat.includes('dingin')) {
    return {
      zone: 'Zone A (Cold Storage -18°C)',
      rack: 'Rak FZ-03',
      bin: 'Kotak FZ-D02',
      fullLocation: 'Zone A • Rak FZ-03 [Kotak FZ-D02]',
      temp: '-18°C',
    };
  }

  if (wh.includes('KITCHEN') || cat.includes('produce') || cat.includes('sayur') || cat.includes('fresh')) {
    return {
      zone: 'Zone B (Kitchen Prep Station)',
      rack: 'Station CK-01',
      bin: 'Kotak M-05',
      fullLocation: 'Zone B • Station CK-01 [Kotak M-05]',
      temp: '18°C',
    };
  }

  return {
    zone: 'Zone B (Dry Storage Shelf)',
    rack: 'Rak SH-02',
    bin: 'Kotak SH-T06',
    fullLocation: 'Zone B • Rak SH-02 [Kotak SH-T06]',
    temp: '22°C',
  };
}

/**
 * Checks whether a warehouse is a Commissary Kitchen designated for Mitra Resto orders
 */
export function isMitraCommissaryWarehouse(warehouse: { code?: string; name?: string }): boolean {
  const code = (warehouse.code || '').toUpperCase();
  const name = (warehouse.name || '').toLowerCase();
  return (
    code.includes('KITCHEN') ||
    code.includes('COMMISSARY') ||
    name.includes('kitchen') ||
    name.includes('commissary') ||
    name.includes('dapur sentral')
  );
}

/**
 * Recommends which warehouse should receive supplier PO based on category/items
 */
export function getRecommendedWarehouseForSupplierOrder(
  productsInOrder: Array<{ categoryName?: string; name?: string; code?: string }>,
  warehouses: Array<{ id: string; code: string; name: string }>
): { warehouseId: string; reason: string } {
  // If order contains cold/fresh/meat/seafood/dairy -> WH-COLD-01
  const hasCold = productsInOrder.some((p) => {
    const cat = (p.categoryName || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    const code = (p.code || '').toUpperCase();
    return (
      cat.includes('meat') ||
      cat.includes('poultry') ||
      cat.includes('seafood') ||
      cat.includes('dairy') ||
      name.includes('beef') ||
      name.includes('wagyu') ||
      name.includes('ayam') ||
      name.includes('salmon') ||
      name.includes('prawn') ||
      name.includes('keju') ||
      code.includes('WAGYU') ||
      code.includes('SALMON') ||
      code.includes('PRAWN') ||
      code.includes('CHICKEN')
    );
  });

  if (hasCold) {
    const coldWh = warehouses.find((w) => w.code.includes('COLD') || w.name.toLowerCase().includes('cold'));
    if (coldWh) {
      return {
        warehouseId: coldWh.id,
        reason: 'Pesanan mengandung produk dingin/beku (Daging/Seafood/Dairy) -> Wajib ke Central Cold Storage (-18°C).',
      };
    }
  }

  // Otherwise recommend Dry Hub
  const dryWh = warehouses.find((w) => w.code.includes('DRY') || w.name.toLowerCase().includes('dry'));
  if (dryWh) {
    return {
      warehouseId: dryWh.id,
      reason: 'Pesanan bahan kering/packaging -> Diarahkan ke Central Dry Distribution Hub.',
    };
  }

  return {
    warehouseId: warehouses[0]?.id || '',
    reason: 'Gudang operasional standar.',
  };
}
