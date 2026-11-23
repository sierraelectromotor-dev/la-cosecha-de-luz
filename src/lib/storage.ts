'use client';

import { Product, StoreConfig, StaffMember, InventoryEntry, Order, OrderStatus, CustomerData, CartItem } from '@/types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_STORE_CONFIG, 
  INITIAL_STAFF, 
  INITIAL_INVENTORY_ENTRIES, 
  INITIAL_ORDERS 
} from './initialData';

const KEYS = {
  PRODUCTS: 'cosecha_luz_products',
  CONFIG: 'cosecha_luz_config',
  STAFF: 'cosecha_luz_staff',
  INVENTORY: 'cosecha_luz_inventory',
  ORDERS: 'cosecha_luz_orders',
  CUSTOMER: 'cosecha_luz_customer',
  CART: 'cosecha_luz_cart',
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('cosecha_storage_updated'));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export const StorageService = {
  // Config
  getConfig: (): StoreConfig => safeGet<StoreConfig>(KEYS.CONFIG, INITIAL_STORE_CONFIG),
  saveConfig: (config: StoreConfig) => safeSet(KEYS.CONFIG, config),

  // Products
  getProducts: (): Product[] => safeGet<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProduct: (product: Product) => {
    const products = StorageService.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.unshift(product);
    }
    safeSet(KEYS.PRODUCTS, products);
  },
  deleteProduct: (id: string) => {
    const products = StorageService.getProducts().filter((p) => p.id !== id);
    safeSet(KEYS.PRODUCTS, products);
  },

  // Inventory Inflows
  getInventoryEntries: (): InventoryEntry[] => safeGet<InventoryEntry[]>(KEYS.INVENTORY, INITIAL_INVENTORY_ENTRIES),
  addInventoryEntry: (entry: InventoryEntry) => {
    const entries = StorageService.getInventoryEntries();
    entries.unshift(entry);
    safeSet(KEYS.INVENTORY, entries);

    // Auto-update stock & cost & price in product catalog
    const products = StorageService.getProducts();
    const prodIdx = products.findIndex((p) => p.id === entry.productId);
    if (prodIdx >= 0) {
      const prod = products[prodIdx];
      prod.stock = (Number(prod.stock) || 0) + Number(entry.quantityAdded);
      if (entry.purchaseCost > 0) prod.cost = entry.purchaseCost;
      if (entry.sellingPrice > 0) prod.price = entry.sellingPrice;
      products[prodIdx] = { ...prod };
      safeSet(KEYS.PRODUCTS, products);
    }
  },

  // Orders
  getOrders: (): Order[] => safeGet<Order[]>(KEYS.ORDERS, INITIAL_ORDERS),
  saveOrder: (order: Order) => {
    const orders = StorageService.getOrders();
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      orders[idx] = order;
    } else {
      orders.unshift(order);
      // Reduce product stock accordingly
      const products = StorageService.getProducts();
      order.items.forEach((item) => {
        const pIdx = products.findIndex((p) => p.id === item.productId);
        if (pIdx >= 0) {
          products[pIdx].stock = Math.max(0, (products[pIdx].stock || 0) - item.quantity);
        }
      });
      safeSet(KEYS.PRODUCTS, products);
    }
    safeSet(KEYS.ORDERS, orders);
  },
  updateOrderStatus: (
    orderId: string, 
    status: OrderStatus, 
    assignedToRole?: 'tendero' | 'repartidor' | 'administrador',
    assignedPersonName?: string,
    notes?: string
  ) => {
    const orders = StorageService.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = status;
      if (status === 'confirmado' || status === 'alistamiento' || status === 'en_camino' || status === 'entregado') {
        orders[idx].paymentConfirmed = true;
      }
      if (assignedToRole) orders[idx].assignedToRole = assignedToRole;
      if (assignedPersonName) orders[idx].assignedPersonName = assignedPersonName;
      if (notes) orders[idx].notes = notes;
      safeSet(KEYS.ORDERS, orders);
    }
  },

  // Staff
  getStaff: (): StaffMember[] => safeGet<StaffMember[]>(KEYS.STAFF, INITIAL_STAFF),
  saveStaff: (staff: StaffMember) => {
    const list = StorageService.getStaff();
    const idx = list.findIndex((s) => s.id === staff.id);
    if (idx >= 0) {
      list[idx] = staff;
    } else {
      list.push(staff);
    }
    safeSet(KEYS.STAFF, list);
  },
  deleteStaff: (id: string) => {
    const list = StorageService.getStaff().filter((s) => s.id !== id);
    safeSet(KEYS.STAFF, list);
  },

  // Customer Remember
  getCustomer: (): Partial<CustomerData> | null => safeGet<Partial<CustomerData> | null>(KEYS.CUSTOMER, null),
  saveCustomer: (cust: Partial<CustomerData>) => safeSet(KEYS.CUSTOMER, cust),

  // Cart Persistence
  getCart: (): CartItem[] => safeGet<CartItem[]>(KEYS.CART, []),
  saveCart: (cart: CartItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  },
  clearCart: () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(KEYS.CART);
    } catch (e) {
      console.error('Error clearing cart:', e);
    }
  },

  // Reset to default seed
  resetDefaults: () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(KEYS.PRODUCTS);
    window.localStorage.removeItem(KEYS.CONFIG);
    window.localStorage.removeItem(KEYS.STAFF);
    window.localStorage.removeItem(KEYS.INVENTORY);
    window.localStorage.removeItem(KEYS.ORDERS);
    window.dispatchEvent(new Event('cosecha_storage_updated'));
  }
};
