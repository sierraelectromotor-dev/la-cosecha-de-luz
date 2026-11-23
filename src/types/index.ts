export type UnitOfMeasure = 
  | 'kg' 
  | 'libra' 
  | '500g' 
  | '250g' 
  | 'unidad' 
  | 'atado' 
  | 'bandeja' 
  | 'docena' 
  | 'litro';

export type ProductCategory = 
  | 'frutas' 
  | 'verduras' 
  | 'tuberculos' 
  | 'combos' 
  | 'despensa' 
  | 'hierbas_aromaticas';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number; // Precio de venta al público en COP
  cost: number;  // Costo de compra/adquisición en COP
  unit: UnitOfMeasure;
  stock: number; // Stock disponible
  minStockAlert: number;
  imageUrl: string;
  isActive: boolean;
  isPromo: boolean;
  promoPrice?: number;
  promoTag?: string; // Ej: "Oferta del Día", "2x1", "Cosecha Fresca"
  tags?: string[];
  suggestedPairs?: string[]; // IDs de productos complementarios para venta por oportunidad
}

export type OrderStatus = 
  | 'pendiente_pago' 
  | 'confirmado' 
  | 'alistamiento' 
  | 'en_camino' 
  | 'entregado' 
  | 'cancelado';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'nequi' | 'daviplata' | 'bancolombia' | 'efectivo_contraentrega';

export interface CustomerData {
  name: string;
  phone: string; // WhatsApp
  residentialZone: string; // Ej: Parque Heredia, La Carolina, Ciudad Jardín
  complexName: string; // Ej: Amaneceres, Coral, Flamingo, etc.
  towerApartment: string; // Ej: Torre 3 Apto 502 / Mz B Lote 12
  notes?: string;
  paymentMethod: PaymentMethod;
  cashAmountToPayWith?: number; // Para saber cambio si paga en efectivo
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerData;
  items: {
    productId: string;
    productName: string;
    unit: UnitOfMeasure;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentConfirmed: boolean;
  assignedToRole?: 'tendero' | 'repartidor' | 'administrador';
  assignedPersonName?: string;
  notes?: string;
}

export interface InventoryEntry {
  id: string;
  productId: string;
  productName: string;
  date: string;
  quantityAdded: number;
  purchaseCost: number; // Costo unitario de compra
  sellingPrice: number; // Precio de venta actualizado
  supplier?: string;
  invoiceOrLot?: string;
  registeredBy: string;
  notes?: string;
}

export type UserRoleType = 'administrador' | 'tendero' | 'repartidor';

export interface StaffMember {
  id: string;
  name: string;
  role: UserRoleType;
  phone: string;
  active: boolean;
  notes?: string;
}

export interface StoreConfig {
  storeName: string;
  whatsappNumber: string; // Número de WhatsApp donde llegan los pedidos (ej: 573001234567)
  address: string;
  city: string;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
  nequiNumber: string;
  daviplataNumber: string;
  bancolombiaAccount: string;
  bancolombiaType: 'Ahorros' | 'Corriente';
  deliveryZones: {
    zone: string;
    name: string;
    fee: number;
  }[];
  bannerPromoTitle: string;
  bannerPromoSubtitle: string;
  adminPin: string;
  tenderoPin: string;
  repartidorPin: string;
}
