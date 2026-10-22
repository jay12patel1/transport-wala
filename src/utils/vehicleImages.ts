/**
 * Transport Wala - Commercial Freight & Vehicle Category Image Library
 * Provides authentic, high-resolution commercial logistics and freight vehicle visuals.
 * 
 * Strict Category Mapping:
 * - Milk Tanker / Milk Tencor -> Food-grade stainless steel milk tanker truck
 * - Loading Truck -> Commercial cargo loading truck
 * - 20 Ft Container -> 20-foot shipping container truck
 * - 30 Ft Container -> 30-foot freight container truck
 * - 32 Ft Container -> 32-foot multi-axle high-cube container truck
 * - Refer / Reefer Vehicle -> Refrigerated cold-chain box truck (-20°C)
 * - Trailer -> 40 ft multi-axle heavy flatbed trailer
 * - Tencor / Tenkor -> 10-wheel open high-side commercial truck
 * - Tata 407 -> Light commercial vehicle mini cargo truck
 */

export const COMMERCIAL_VEHICLE_IMAGES = {
  // 1. Milk Tanker / Milk Tencor (Stainless steel food-grade dairy milk transport tanker)
  MILK_TANKER: 'https://images.unsplash.com/photo-1586191582056-a602167d3e91?w=800&auto=format&fit=crop&q=80',

  // 2. Loading Truck (Commercial cargo loading truck for goods transportation)
  LOADING_TRUCK: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&auto=format&fit=crop&q=80',

  // 3. 20 ft Container Truck (20-foot shipping container truck on commercial chassis)
  CONTAINER_20FT: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80',

  // 4. 30 ft Container Truck (Commercial 30-foot highway freight container carrier)
  CONTAINER_30FT: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
  
  // 5. 32 ft Container Truck (32-foot multi-axle HQ closed container long-hauler)
  CONTAINER_32FT: 'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?w=800&auto=format&fit=crop&q=80',
  
  // 6. Refrigerated / Reefer Cold Chain Truck (-20°C insulated box truck with cooling compressor)
  REEFER_COLD_CHAIN: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=800&auto=format&fit=crop&q=80',
  
  // 7. 40 ft Flatbed / Heavy High-Tonnage Trailer
  TRAILER_FLATBED: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=800&auto=format&fit=crop&q=80',
  
  // 8. Tencor / Tenkor 10-Wheel Open High-Side Commercial Truck
  TENCOR_OPEN: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',

  // 9. Tata 407 / Light Commercial Vehicle (LCV Mini Cargo)
  TATA_407_LCV: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=800&auto=format&fit=crop&q=80',
  
  // Logistics Warehouse & Freight Hub
  WAREHOUSE_HUB: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',

  // Dashboard & Landing Hero Banner
  HERO_TRANSPORT_BG: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&auto=format&fit=crop&q=80',
};

export interface VehicleTypeSpec {
  id: string;
  name: string;
  category: 'Container' | 'Open Truck' | 'Closed Body' | 'Trailer' | 'Special' | 'Tanker';
  defaultSize: string;
  defaultCapacityTon: number;
  defaultCapacityKg: number;
  defaultFare: number;
  defaultPerKm: number;
  isRefrigerated: boolean;
  image: string;
  description: string;
  popularFor: string;
}

export const VEHICLE_TYPE_CATALOG: VehicleTypeSpec[] = [
  {
    id: 'cat_milk_tanker',
    name: 'Milk Tanker / Milk Tencor',
    category: 'Tanker',
    defaultSize: '18,000 Litres (Food-Grade Stainless Steel 304)',
    defaultCapacityTon: 18,
    defaultCapacityKg: 18000,
    defaultFare: 32000,
    defaultPerKm: 60,
    isRefrigerated: false,
    image: COMMERCIAL_VEHICLE_IMAGES.MILK_TANKER,
    description: 'Insulated stainless steel food-grade milk tanker truck for dairy collection, milk chilling plants, and bulk edible liquid transport.',
    popularFor: 'Amul Dairy Hubs, Milk Chilling Centers, Liquid Transport'
  },
  {
    id: 'cat_loading_truck',
    name: 'Loading Truck',
    category: 'Open Truck',
    defaultSize: '19 ft x 7.5 ft Cargo Loading Body',
    defaultCapacityTon: 7.5,
    defaultCapacityKg: 7500,
    defaultFare: 12000,
    defaultPerKm: 38,
    isRefrigerated: false,
    image: COMMERCIAL_VEHICLE_IMAGES.LOADING_TRUCK,
    description: 'Commercial cargo loading truck with open/closed body for wholesale goods, freight packages, and factory shipments.',
    popularFor: 'Factory Dispatch, General Goods, Hardware & Parcels'
  },
  {
    id: 'cat_20ft_container',
    name: '20 ft Container',
    category: 'Container',
    defaultSize: '20 ft x 8 ft x 8.5 ft Standard Container',
    defaultCapacityTon: 9.5,
    defaultCapacityKg: 9500,
    defaultFare: 19500,
    defaultPerKm: 42,
    isRefrigerated: false,
    image: COMMERCIAL_VEHICLE_IMAGES.CONTAINER_20FT,
    description: 'Compact 20ft intermodal closed container mounted on commercial chassis. Weatherproof and sealed for secure cargo transport.',
    popularFor: 'Textiles, Electronics, Port Cargo, FMCG Products'
  },
  {
    id: 'cat_30ft_container',
    name: '30 ft Container',
    category: 'Container',
    defaultSize: '30 ft x 8 ft x 8.5 ft High Cube Container',
    defaultCapacityTon: 15,
    defaultCapacityKg: 15000,
    defaultFare: 28500,
    defaultPerKm: 52,
    isRefrigerated: false,
    image: COMMERCIAL_VEHICLE_IMAGES.CONTAINER_30FT,
    description: 'Heavy duty 30ft sealed container truck for high-volume FMCG, industrial machinery, and port logistics.',
    popularFor: 'Industrial Freight, Automotive Parts, Interstate Cargo'
  },
  {
    id: 'cat_32ft_container',
    name: '32 ft Container',
    category: 'Container',
    defaultSize: '32 ft Multi-Axle HQ Closed Body',
    defaultCapacityTon: 18,
    defaultCapacityKg: 18000,
    defaultFare: 38000,
    defaultPerKm: 58,
    isRefrigerated: false,
    image: COMMERCIAL_VEHICLE_IMAGES.CONTAINER_32FT,
    description: '32ft multi-axle long-haul container carrier for national highway freight with high volumetric payload capacity.',
    popularFor: 'National Highway Long-Haul, E-Commerce Logistics'
  },
  {
    id: 'cat_reefer',
    name: 'Refer Vehicle / Refrigerated Vehicle',
    category: 'Special',
    defaultSize: '22 ft Reefer Insulated Box (-20°C to +15°C)',
    defaultCapacityTon: 8,
    defaultCapacityKg: 8000,
    defaultFare: 34000,
    defaultPerKm: 65,
    isRefrigerated: true,
    image: COMMERCIAL_VEHICLE_IMAGES.REEFER_COLD_CHAIN,
    description: 'Active cold chain reefer vehicle with digital temperature logging (-20°C) for pharmaceuticals, ice cream, and dairy.',
    popularFor: 'Pharmaceuticals, Ice Cream, Frozen Foods, Dairy'
  },
  {
    id: 'cat_trailer',
    name: 'Trailer',
    category: 'Trailer',
    defaultSize: '40 ft Flatbed Multi-Axle Heavy Trailer',
    defaultCapacityTon: 35,
    defaultCapacityKg: 35000,
    defaultFare: 55000,
    defaultPerKm: 85,
    isRefrigerated: false,
    image: COMMERCIAL_VEHICLE_IMAGES.TRAILER_FLATBED,
    description: 'Heavy multi-axle 40ft flatbed trailer for oversized steel coils, windmill components, heavy machinery, and high-tonnage cargo.',
    popularFor: 'Steel Coils, Windmill Blades, Heavy Equipment, TMT Bars'
  },
  {
    id: 'cat_tencor',
    name: 'Tencor / Tenkor',
    category: 'Open Truck',
    defaultSize: '24 ft x 7.5 ft High-Side 10-Wheel Body',
    defaultCapacityTon: 16,
    defaultCapacityKg: 16000,
    defaultFare: 16000,
    defaultPerKm: 48,
    isRefrigerated: false,
    image: COMMERCIAL_VEHICLE_IMAGES.TENCOR_OPEN,
    description: '10-wheeler heavy Tencor truck suitable for agricultural grains, pipes, raw materials, and bulk construction logistics.',
    popularFor: 'Agriculture Grains, Raw Materials, Pipes, Construction'
  },
  {
    id: 'cat_tata407',
    name: 'Tata 407',
    category: 'Closed Body',
    defaultSize: '10 ft x 6 ft x 6 ft Mini Cargo Body',
    defaultCapacityTon: 2.5,
    defaultCapacityKg: 2500,
    defaultFare: 6500,
    defaultPerKm: 26,
    isRefrigerated: false,
    image: COMMERCIAL_VEHICLE_IMAGES.TATA_407_LCV,
    description: 'Trusted Tata 407 light commercial vehicle (LCV) for same-day intracity deliveries, e-commerce, and regional distribution.',
    popularFor: 'Intracity Deliveries, E-Commerce, Local Market Parcels'
  }
];

export const VEHICLE_TYPE_NAMES = VEHICLE_TYPE_CATALOG.map(v => v.name);

/**
 * Returns the authentic vehicle image for a given type or category.
 */
export function getVehicleImage(vehicleType?: string, category?: string, isRefrigerated?: boolean): string {
  const vType = (vehicleType || '').toLowerCase().trim();
  const vCat = (category || '').toLowerCase().trim();

  // 1. Specific Milk Tanker / Milk Tencor matching (MUST precede generic tencor/open matching)
  if (
    vType.includes('milk') || 
    vType.includes('tanker') || 
    vType.includes('dairy') || 
    vType.includes('liquid') || 
    vCat.includes('tanker')
  ) {
    return COMMERCIAL_VEHICLE_IMAGES.MILK_TANKER;
  }

  // 2. Loading Truck matching
  if (vType.includes('loading')) {
    return COMMERCIAL_VEHICLE_IMAGES.LOADING_TRUCK;
  }

  // 3. Refrigerated / Reefer matching
  if (
    isRefrigerated || 
    vType.includes('reefer') || 
    vType.includes('refriger') || 
    vType.includes('refer') || 
    vType.includes('cold')
  ) {
    return COMMERCIAL_VEHICLE_IMAGES.REEFER_COLD_CHAIN;
  }

  // 4. 20 ft Container matching
  if (vType.includes('20 ft') || vType.includes('20ft') || vType.includes('20-ft') || vType.includes('20 foot')) {
    return COMMERCIAL_VEHICLE_IMAGES.CONTAINER_20FT;
  }

  // 5. 32 ft Container matching
  if (vType.includes('32 ft') || vType.includes('32ft') || vType.includes('32-ft')) {
    return COMMERCIAL_VEHICLE_IMAGES.CONTAINER_32FT;
  }

  // 6. 30 ft Container matching
  if (vType.includes('30 ft') || vType.includes('30ft') || vType.includes('30-ft')) {
    return COMMERCIAL_VEHICLE_IMAGES.CONTAINER_30FT;
  }

  // 7. General Container matching
  if (vType.includes('container') || vCat.includes('container')) {
    return COMMERCIAL_VEHICLE_IMAGES.CONTAINER_30FT;
  }

  // 8. Trailer matching
  if (vType.includes('trailer') || vCat.includes('trailer')) {
    return COMMERCIAL_VEHICLE_IMAGES.TRAILER_FLATBED;
  }

  // 9. Tata 407 / LCV matching
  if (vType.includes('tata 407') || vType.includes('407') || vType.includes('eicher') || vType.includes('mini')) {
    return COMMERCIAL_VEHICLE_IMAGES.TATA_407_LCV;
  }

  // 10. Tencor / Tenkor 10-wheel open truck matching
  if (vType.includes('tencor') || vType.includes('tenkor')) {
    return COMMERCIAL_VEHICLE_IMAGES.TENCOR_OPEN;
  }

  // 11. Open body truck
  if (vType.includes('open') || vCat.includes('open')) {
    return COMMERCIAL_VEHICLE_IMAGES.TENCOR_OPEN;
  }

  // 12. Special
  if (vCat.includes('special')) {
    return COMMERCIAL_VEHICLE_IMAGES.REEFER_COLD_CHAIN;
  }

  // Default fallback
  return COMMERCIAL_VEHICLE_IMAGES.CONTAINER_30FT;
}


