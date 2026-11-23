'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Product, 
  Order, 
  InventoryEntry, 
  StaffMember, 
  StoreConfig, 
  OrderStatus, 
  UnitOfMeasure, 
  ProductCategory, 
  UserRoleType 
} from '@/types';
import { StorageService } from '@/lib/storage';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Boxes, 
  Users, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Check, 
  AlertCircle, 
  Phone, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  MapPin, 
  Sparkles, 
  Save, 
  RefreshCw,
  Printer,
  ChevronRight,
  Filter,
  Lock,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function AdminPage() {
  // Authentication & Security State
  const [authRole, setAuthRole] = useState<UserRoleType | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginRole, setLoginRole] = useState<UserRoleType>('administrador');
  const [inputPin, setInputPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'inventory' | 'roles' | 'config'>('dashboard');

  // Core Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [config, setConfig] = useState<StoreConfig>(StorageService.getConfig());

  // Filter state for orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'todos'>('todos');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Inventory entry form
  const [newEntry, setNewEntry] = useState({
    productId: '',
    quantityAdded: 10,
    purchaseCost: 2000,
    sellingPrice: 3500,
    supplier: 'Mercado de Bazurto / Finca Proveedora',
    invoiceOrLot: '',
    registeredBy: 'Luz Marina Díaz (Admin)',
    notes: 'Ingreso directo a inventario para disponibilidad inmediata',
  });

  // Staff form
  const [newStaffMember, setNewStaffMember] = useState<StaffMember>({
    id: '',
    name: '',
    role: 'tendero',
    phone: '',
    active: true,
    notes: '',
  });

  // Load all data
  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setOrders(StorageService.getOrders());
    setInventoryEntries(StorageService.getInventoryEntries());
    setStaff(StorageService.getStaff());
    setConfig(StorageService.getConfig());
  };

  useEffect(() => {
    // Check saved session
    if (typeof window !== 'undefined') {
      const savedRole = sessionStorage.getItem('cosecha_admin_role') as UserRoleType | null;
      if (savedRole) {
        setAuthRole(savedRole);
        if (savedRole === 'tendero' || savedRole === 'repartidor') {
          setActiveTab('orders');
        }
      }
      setAuthChecked(true);
    }

    refreshData();
    window.addEventListener('cosecha_storage_updated', refreshData);
    return () => window.removeEventListener('cosecha_storage_updated', refreshData);
  }, []);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanPin = inputPin.trim();

    const adminPin = config.adminPin || '2026';
    const tenderoPin = config.tenderoPin || '1234';
    const repartidorPin = config.repartidorPin || '5678';

    if (cleanPin === adminPin) {
      // Master PIN grants full admin access
      setAuthRole('administrador');
      sessionStorage.setItem('cosecha_admin_role', 'administrador');
      setActiveTab('dashboard');
    } else if (cleanPin === tenderoPin && (loginRole === 'tendero' || loginRole === 'administrador')) {
      setAuthRole('tendero');
      sessionStorage.setItem('cosecha_admin_role', 'tendero');
      setActiveTab('orders');
    } else if (cleanPin === repartidorPin && (loginRole === 'repartidor' || loginRole === 'administrador')) {
      setAuthRole('repartidor');
      sessionStorage.setItem('cosecha_admin_role', 'repartidor');
      setActiveTab('orders');
    } else {
      setLoginError('PIN de seguridad incorrecto para este rol. Revisa los datos e intenta de nuevo.');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cosecha_admin_role');
    }
    setAuthRole(null);
    setInputPin('');
    setLoginError('');
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'todos') return true;
    return o.status === orderStatusFilter;
  });

  // Summary Metrics
  const totalSalesRevenue = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pendiente_pago' || o.status === 'confirmado').length;
  const inPreparationCount = orders.filter((o) => o.status === 'alistamiento').length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  // Handlers for Products
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formData.get('name') as string,
      category: formData.get('category') as ProductCategory,
      description: formData.get('description') as string,
      price: Number(formData.get('price')) || 0,
      cost: Number(formData.get('cost')) || 0,
      unit: formData.get('unit') as UnitOfMeasure,
      stock: Number(formData.get('stock')) || 0,
      minStockAlert: Number(formData.get('minStockAlert')) || 5,
      imageUrl: (formData.get('imageUrl') as string) || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      isActive: formData.get('isActive') === 'on',
      isPromo: formData.get('isPromo') === 'on',
      promoPrice: Number(formData.get('promoPrice')) || undefined,
      promoTag: (formData.get('promoTag') as string) || undefined,
    };

    StorageService.saveProduct(productToSave);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Handlers for Inventory Entry
  const handleAddInventoryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProd = products.find((p) => p.id === newEntry.productId);
    if (!targetProd) return;

    const entryToSave: InventoryEntry = {
      id: `inv-${Date.now()}`,
      productId: targetProd.id,
      productName: targetProd.name,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      quantityAdded: Number(newEntry.quantityAdded),
      purchaseCost: Number(newEntry.purchaseCost),
      sellingPrice: Number(newEntry.sellingPrice),
      supplier: newEntry.supplier,
      invoiceOrLot: newEntry.invoiceOrLot || `LOTE-${Date.now().toString().slice(-4)}`,
      registeredBy: newEntry.registeredBy,
      notes: newEntry.notes,
    };

    StorageService.addInventoryEntry(entryToSave);
    setIsInventoryModalOpen(false);
  };

  // Handlers for Staff
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffMember.name.trim()) return;

    const member: StaffMember = {
      ...newStaffMember,
      id: newStaffMember.id || `staff-${Date.now()}`,
    };

    StorageService.saveStaff(member);
    setIsStaffModalOpen(false);
    setNewStaffMember({
      id: '',
      name: '',
      role: 'tendero',
      phone: '',
      active: true,
      notes: '',
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, newStatus);
    if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
      setSelectedOrderForDetail((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAssignStaff = (orderId: string, role: 'tendero' | 'repartidor', staffName: string) => {
    StorageService.updateOrderStatus(orderId, 'alistamiento', role, staffName);
    refreshData();
  };

  const handleSaveStoreConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const updatedConfig: StoreConfig = {
      ...config,
      storeName: formData.get('storeName') as string,
      whatsappNumber: formData.get('whatsappNumber') as string,
      nequiNumber: formData.get('nequiNumber') as string,
      daviplataNumber: formData.get('daviplataNumber') as string,
      defaultDeliveryFee: Number(formData.get('defaultDeliveryFee')) || 3000,
      freeDeliveryThreshold: Number(formData.get('freeDeliveryThreshold')) || 45000,
      bannerPromoTitle: formData.get('bannerPromoTitle') as string,
      bannerPromoSubtitle: formData.get('bannerPromoSubtitle') as string,
      adminPin: (formData.get('adminPin') as string) || config.adminPin || '2026',
      tenderoPin: (formData.get('tenderoPin') as string) || config.tenderoPin || '1234',
      repartidorPin: (formData.get('repartidorPin') as string) || config.repartidorPin || '5678',
    };

    StorageService.saveConfig(updatedConfig);
    setConfig(updatedConfig);
    alert('Configuración y PINs de seguridad guardados correctamente.');
  };

  // Determine allowed tabs based on user role
  const getAllowedTabs = () => {
    if (authRole === 'administrador') {
      return [
        { id: 'dashboard', label: 'Dashboard & Métricas', icon: LayoutDashboard },
        { id: 'orders', label: `Pedidos en Vivo (${pendingOrdersCount})`, icon: ClipboardList },
        { id: 'products', label: 'Catálogo de Productos', icon: Package },
        { id: 'inventory', label: 'Módulo de Inventario', icon: Boxes },
        { id: 'roles', label: 'Tenderos & Repartidores', icon: Users },
        { id: 'config', label: 'Configuración Tienda & PINs', icon: Settings },
      ];
    }
    if (authRole === 'tendero') {
      return [
        { id: 'orders', label: `Alistamiento de Pedidos (${pendingOrdersCount})`, icon: ClipboardList },
        { id: 'inventory', label: 'Ingresos & Inventario', icon: Boxes },
      ];
    }
    if (authRole === 'repartidor') {
      return [
        { id: 'orders', label: `Ruta de Despacho & Entregas`, icon: Truck },
      ];
    }
    return [];
  };

  // ================= SECURITY LOCKSCREEN SCREEN =================
  if (authChecked && !authRole) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-stone-950/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl space-y-6 relative z-10 text-white">
          {/* Brand header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 border border-emerald-400/40">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Acceso Restringido • Seguridad
            </div>
            <h1 className="text-2xl font-black font-serif text-white">
              Portal de Administración
            </h1>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              La Cosecha de Luz - Minimarket Cartagena. Ingresa tu PIN de seguridad asignado.
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-300 block">
              1. Selecciona tu Rol Operativo:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-900 rounded-2xl border border-stone-800">
              {[
                { id: 'administrador', label: 'Admin', icon: '👑' },
                { id: 'tendero', label: 'Tendero', icon: '🧺' },
                { id: 'repartidor', label: 'Repartidor', icon: '🛵' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setLoginRole(r.id as UserRoleType);
                    setLoginError('');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    loginRole === r.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span className="capitalize">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
                <label htmlFor="pin">2. PIN de Seguridad:</label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                </div>
                <input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  maxLength={8}
                  value={inputPin}
                  onChange={(e) => {
                    setInputPin(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Ingresa tu PIN numérico..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-white text-center text-lg tracking-widest outline-none transition"
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition active:scale-98 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Desbloquear y Acceder</span>
            </button>
          </form>

          {/* Quick Demo Credentials Guide */}
          <div className="p-3.5 bg-stone-900/80 rounded-2xl border border-stone-800 text-[11px] text-stone-400 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PINs predeterminados de demostración:</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
              <div className="bg-stone-800/80 p-1.5 rounded-lg border border-stone-700">
                <span className="text-stone-400 block text-[9px]">Admin</span>
                <strong className="text-white text-xs">2026</strong>
              </div>
              <div className="bg-stone-800/80 p-1.5 rounded-lg border border-stone-700">
                <span className="text-stone-400 block text-[9px]">Tendero</span>
                <strong className="text-white text-xs">1234</strong>
              </div>
              <div className="bg-stone-800/80 p-1.5 rounded-lg border border-stone-700">
                <span className="text-stone-400 block text-[9px]">Repartidor</span>
                <strong className="text-white text-xs">5678</strong>
              </div>
            </div>
            <p className="text-[10px] text-stone-500 pt-0.5">
              * Podrás cambiar estos PINs en cualquier momento dentro de la pestaña Configuración.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-stone-400 hover:text-white text-xs inline-flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Regresar a la Tienda de Clientes</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN AUTHENTICATED ADMIN DASHBOARD =================
  const allowedTabs = getAllowedTabs();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900">
      {/* Admin Top Header */}
      <header className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white border-b border-emerald-800/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-emerald-200 hover:text-white cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Tienda</span>
            </Link>

            <div className="h-4 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xl">🥑</span>
              <div>
                <h1 className="font-black text-sm sm:text-base leading-tight">
                  La Cosecha de Luz • <span className="text-amber-400">Portal de Administración</span>
                </h1>
                <p className="text-[11px] text-emerald-300">
                  Cartagena: Parque Heredia • El Recreo • La Carolina • Terminal • Guanabara • Villas y más
                </p>
              </div>
            </div>
          </div>

          {/* Active Role Badge & Logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-[11px]">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-stone-300">Sesión:</span>
              <strong className="text-amber-300 uppercase font-black">{authRole}</strong>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/40 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              title="Cerrar Sesión Segura"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-white/10 text-xs font-semibold">
          {allowedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-300 font-bold bg-white/5'
                    : 'border-transparent text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && authRole === 'administrador' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Ventas Totales Registradas</div>
                  <div className="text-2xl font-black text-emerald-800 mt-1">
                    ${totalSalesRevenue.toLocaleString('es-CO')}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {orders.length} pedidos procesados
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Pedidos por Confirmar / Pago</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {pendingOrdersCount}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Requieren validación o Nequi
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">En Alistamiento / Ruta</div>
                  <div className="text-2xl font-black text-teal-700 mt-1">
                    {inPreparationCount + orders.filter((o) => o.status === 'en_camino').length}
                  </div>
                  <div className="text-[11px] text-teal-600 font-semibold mt-1">
                    Tenderos y repartidores activos
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Alerta de Stock Crítico</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {lowStockCount}
                  </div>
                  <div className="text-[11px] text-rose-600 font-semibold mt-1">
                    Productos por agotar
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Orders Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent Orders */}
              <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Últimos Pedidos en Vivo</h3>
                    <p className="text-xs text-stone-500">Parque Heredia, El Recreo, La Carolina, Guanabara, Villas y todo el sector</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todos los pedidos</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{order.orderNumber}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            order.status === 'entregado' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'en_camino' ? 'bg-teal-100 text-teal-800' :
                            order.status === 'alistamiento' ? 'bg-indigo-100 text-indigo-800' :
                            order.status === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 font-medium">
                          👤 {order.customer.name} • 📍 {order.customer.complexName} ({order.customer.towerApartment})
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {order.items.length} productos • Pago: <span className="uppercase font-semibold">{order.customer.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                        <div className="text-sm font-black text-stone-900">
                          ${order.total.toLocaleString('es-CO')}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrderForDetail(order);
                            setActiveTab('orders');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer transition"
                        >
                          Gestionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Roles & Team On Duty */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 text-base">Equipo en Turno</h3>
                    <button
                      onClick={() => setActiveTab('roles')}
                      className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Gestionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {staff.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-stone-900">{s.name}</div>
                          <div className="text-[10px] text-stone-500 capitalize">
                            Rol: <span className="font-semibold text-emerald-700">{s.role}</span>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/57${s.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                          title="Contactar por WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Add Inventory shortcut */}
                <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-3xl shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-amber-300" />
                    <h3 className="font-bold text-sm">¿Llegó mercancía fresca hoy?</h3>
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    Registra la entrada con costo de compra y se suma de inmediato a la disponibilidad de la tienda en Cartagena.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setIsInventoryModalOpen(true);
                    }}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Ingreso de Mercancía</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif">
                  {authRole === 'tendero' ? 'Alistamiento de Pedidos (Tendero)' :
                   authRole === 'repartidor' ? 'Rutas de Entrega (Repartidor)' :
                   'Gestión de Pedidos & Alistamiento'}
                </h2>
                <p className="text-xs text-stone-500">
                  Controla pedidos y entregas en casas, locales y conjuntos de todo el sector.
                </p>
              </div>

              {/* Status filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'pendiente_pago', label: 'Pendiente Pago' },
                  { id: 'confirmado', label: 'Confirmado' },
                  { id: 'alistamiento', label: 'En Alistamiento' },
                  { id: 'en_camino', label: 'En Camino' },
                  { id: 'entregado', label: 'Entregados' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === st.id
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List & Detail View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Order Cards */}
              <div className="lg:col-span-7 space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-2">
                    <div className="text-3xl">📦</div>
                    <div className="font-bold text-stone-800 text-sm">No hay pedidos con este estado</div>
                    <p className="text-xs text-stone-500">Selecciona otro filtro para ver los demás pedidos.</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrderForDetail?.id === order.id;
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForDetail(order)}
                        className={`p-4 rounded-3xl bg-white border transition-all cursor-pointer shadow-xs ${
                          isSelected
                            ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                            : 'border-stone-200/90 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-stone-900">{order.orderNumber}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                order.status === 'entregado' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'en_camino' ? 'bg-teal-100 text-teal-800' :
                                order.status === 'alistamiento' ? 'bg-indigo-100 text-indigo-800' :
                                order.status === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="font-bold text-xs text-stone-800">
                              {order.customer.name} • <span className="text-emerald-700">{order.customer.complexName}</span>
                            </div>
                            <div className="text-xs text-stone-500">
                              Ubicación: <strong className="text-stone-700">{order.customer.towerApartment}</strong>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-black text-stone-900">
                              ${order.total.toLocaleString('es-CO')}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              {order.items.length} ítems
                            </div>
                          </div>
                        </div>

                        {/* Order Timeline step indicator */}
                        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-stone-500">
                            <span>Pago:</span>
                            <span className="font-bold uppercase text-stone-800">{order.customer.paymentMethod}</span>
                            {order.paymentConfirmed ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Aprobado
                              </span>
                            ) : (
                              <span className="text-amber-600 font-semibold">Por verificar</span>
                            )}
                          </div>

                          <div className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                            <span>Ver detalles &rarr;</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Order Detail & Action Sheet */}
              <div className="lg:col-span-5">
                {selectedOrderForDetail ? (
                  <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-md space-y-4 sticky top-24">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Ficha de Pedido</span>
                        <h3 className="font-black text-lg text-stone-900">{selectedOrderForDetail.orderNumber}</h3>
                      </div>
                      <a
                        href={`https://wa.me/57${selectedOrderForDetail.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${selectedOrderForDetail.customer.name}, te escribimos de La Cosecha de Luz respecto a tu pedido ${selectedOrderForDetail.orderNumber}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 space-y-1.5 text-xs">
                      <div className="font-bold text-stone-800 text-sm">{selectedOrderForDetail.customer.name}</div>
                      <div className="text-stone-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{selectedOrderForDetail.customer.complexName}</span>
                      </div>
                      <div className="text-stone-600 pl-4.5">
                        {selectedOrderForDetail.customer.towerApartment}
                      </div>
                      <div className="text-stone-600 pl-4.5">
                        WhatsApp: <strong>{selectedOrderForDetail.customer.phone}</strong>
                      </div>
                      {selectedOrderForDetail.customer.notes && (
                        <div className="mt-2 pt-2 border-t border-stone-200 text-amber-900 bg-amber-50 p-2 rounded-lg">
                          <strong>Nota del cliente:</strong> {selectedOrderForDetail.customer.notes}
                        </div>
                      )}
                    </div>

                    {/* Items List for Tendero alistamiento */}
                    <div className="space-y-2">
                      <div className="font-bold text-xs text-stone-700 uppercase tracking-wide flex items-center justify-between">
                        <span>Items para Alistar (Tendero)</span>
                        <span className="text-stone-400 font-normal">{selectedOrderForDetail.items.length} productos</span>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                        {selectedOrderForDetail.items.map((it, i) => (
                          <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-stone-50 border border-stone-100">
                            <div>
                              <div className="font-bold text-stone-900">{it.productName}</div>
                              <div className="text-[11px] text-stone-500 font-medium">
                                {it.quantity} x {it.unit}
                              </div>
                            </div>
                            <div className="font-bold text-stone-900">
                              ${it.subtotal.toLocaleString('es-CO')}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Financial summary */}
                      <div className="pt-2 border-t border-stone-100 space-y-1 text-xs">
                        <div className="flex justify-between text-stone-500">
                          <span>Subtotal:</span>
                          <span>${selectedOrderForDetail.subtotal.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Domicilio ({selectedOrderForDetail.customer.residentialZone}):</span>
                          <span>${selectedOrderForDetail.deliveryFee.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="flex justify-between font-black text-sm text-stone-900 pt-1 border-t border-stone-200">
                          <span>Total a cobrar:</span>
                          <span className="text-emerald-700">${selectedOrderForDetail.total.toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Workflow Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <div className="font-bold text-xs text-stone-700">Cambiar Estado del Pedido:</div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrderForDetail.id, 'confirmado')}
                          className={`p-2 rounded-xl font-bold transition cursor-pointer text-center ${
                            selectedOrderForDetail.status === 'confirmado'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                          }`}
                        >
                          1. Confirmar Pago
                        </button>

                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrderForDetail.id, 'alistamiento')}
                          className={`p-2 rounded-xl font-bold transition cursor-pointer text-center ${
                            selectedOrderForDetail.status === 'alistamiento'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                          }`}
                        >
                          2. En Alistamiento
                        </button>

                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrderForDetail.id, 'en_camino')}
                          className={`p-2 rounded-xl font-bold transition cursor-pointer text-center ${
                            selectedOrderForDetail.status === 'en_camino'
                              ? 'bg-teal-600 text-white'
                              : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                          }`}
                        >
                          3. En Camino / Domicilio
                        </button>

                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrderForDetail.id, 'entregado')}
                          className={`p-2 rounded-xl font-bold transition cursor-pointer text-center ${
                            selectedOrderForDetail.status === 'entregado'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          4. Entregado con Éxito
                        </button>
                      </div>

                      {/* Staff Assignment */}
                      {authRole === 'administrador' && (
                        <div className="pt-2">
                          <label className="text-[11px] font-bold text-stone-600 block mb-1">
                            Asignar Responsable en Tienda:
                          </label>
                          <select
                            value={selectedOrderForDetail.assignedPersonName || ''}
                            onChange={(e) => {
                              const selectedStaff = staff.find((s) => s.name === e.target.value);
                              if (selectedStaff) {
                                handleAssignStaff(selectedOrderForDetail.id, selectedStaff.role as any, selectedStaff.name);
                              }
                            }}
                            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                          >
                            <option value="">Seleccionar responsable...</option>
                            {staff.map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.name} ({s.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-3">
                    <div className="text-3xl text-stone-300">📋</div>
                    <div className="font-bold text-stone-800 text-sm">Selecciona un pedido</div>
                    <p className="text-xs text-stone-500">
                      Haz clic en cualquier pedido de la izquierda para ver el desglose, alistar los productos y asignar repartidor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRODUCTS CATALOG ================= */}
        {activeTab === 'products' && authRole === 'administrador' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif">
                  Catálogo de Productos ({products.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Crea productos con foto, unidad de medida (kg, libra, unidad, atado), precio y promociones del día.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Producto</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Producto</th>
                      <th className="p-3.5">Categoría</th>
                      <th className="p-3.5">Unidad Venta</th>
                      <th className="p-3.5">Costo Compra</th>
                      <th className="p-3.5">Precio Venta</th>
                      <th className="p-3.5">Margen</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Promo Banner</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((p) => {
                      const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
                      return (
                        <tr key={p.id} className="hover:bg-stone-50/80 transition">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                              />
                              <div>
                                <div className="font-bold text-stone-900">{p.name}</div>
                                <div className="text-[11px] text-stone-400 line-clamp-1">{p.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 capitalize font-medium text-stone-700">{p.category.replace('_', ' ')}</td>
                          <td className="p-3.5 font-bold text-emerald-800">{p.unit}</td>
                          <td className="p-3.5 text-stone-500">${p.cost.toLocaleString('es-CO')}</td>
                          <td className="p-3.5 font-black text-stone-900">
                            ${p.price.toLocaleString('es-CO')}
                            {p.isPromo && p.promoPrice && (
                              <div className="text-[10px] text-amber-600 font-bold">
                                Promo: ${p.promoPrice.toLocaleString('es-CO')}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              margin >= 40 ? 'bg-emerald-100 text-emerald-800' :
                              margin >= 25 ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {margin}%
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`font-bold ${p.stock <= p.minStockAlert ? 'text-rose-600' : 'text-stone-800'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {p.isPromo ? (
                              <span className="text-amber-800 bg-amber-100 font-bold text-[10px] px-2 py-0.5 rounded-md">
                                {p.promoTag || 'En Banner'}
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar ${p.name}?`)) {
                                  StorageService.deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: INVENTORY MODULE ================= */}
        {activeTab === 'inventory' && (authRole === 'administrador' || authRole === 'tendero') && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif">
                  Módulo de Inventario & Ingresos de Mercancía
                </h2>
                <p className="text-xs text-stone-500">
                  Registra compras mayoristas en Mercado de Bazurto o fincas. El stock se actualiza inmediatamente para la venta.
                </p>
              </div>

              <button
                onClick={() => setIsInventoryModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Entrada de Mercancía</span>
              </button>
            </div>

            {/* Inventory Inflows History Table */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden space-y-4 p-5">
              <h3 className="font-bold text-stone-900 text-sm">Historial de Ingresos a Inventario (Kardex)</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Cantidad Ingresada</th>
                      <th className="p-3">Costo de Compra</th>
                      <th className="p-3">Precio Venta Asignado</th>
                      <th className="p-3">Margen Ganancia</th>
                      <th className="p-3">Proveedor / Lote</th>
                      <th className="p-3">Registrado por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {inventoryEntries.map((entry) => {
                      const margin = entry.sellingPrice > 0 
                        ? Math.round(((entry.sellingPrice - entry.purchaseCost) / entry.sellingPrice) * 100) 
                        : 0;

                      return (
                        <tr key={entry.id} className="hover:bg-stone-50/80 transition">
                          <td className="p-3 text-stone-500 font-medium">{entry.date}</td>
                          <td className="p-3 font-bold text-stone-900">{entry.productName}</td>
                          <td className="p-3 font-black text-emerald-800">+{entry.quantityAdded}</td>
                          <td className="p-3 text-stone-600">${entry.purchaseCost.toLocaleString('es-CO')}</td>
                          <td className="p-3 font-bold text-stone-900">${entry.sellingPrice.toLocaleString('es-CO')}</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                              {margin}%
                            </span>
                          </td>
                          <td className="p-3 text-stone-500">
                            <div>{entry.supplier}</div>
                            <div className="text-[10px] text-stone-400">{entry.invoiceOrLot}</div>
                          </td>
                          <td className="p-3 text-stone-600 font-medium">{entry.registeredBy}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: ROLES & STAFF ================= */}
        {activeTab === 'roles' && authRole === 'administrador' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif">
                  Roles & Equipo de Trabajo
                </h2>
                <p className="text-xs text-stone-500">
                  Define tenderos encargados de pesar y alistar pedidos, repartidores con cobertura a conjuntos y administradores.
                </p>
              </div>

              <button
                onClick={() => {
                  setNewStaffMember({
                    id: '',
                    name: '',
                    role: 'tendero',
                    phone: '',
                    active: true,
                    notes: '',
                  });
                  setIsStaffModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Colaborador</span>
              </button>
            </div>

            {/* Roles explanation card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-3xl space-y-1.5 text-xs text-emerald-950">
                <span className="font-extrabold text-emerald-800 block text-sm">👑 Rol Administrador</span>
                <p>Supervisa inventario, costos, precios, reporte de ventas y configuración general de la tienda y WhatsApp.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-3xl space-y-1.5 text-xs text-amber-950">
                <span className="font-extrabold text-amber-800 block text-sm">🧺 Rol Tendero / Alistador</span>
                <p>Pesa frutas y verduras, selecciona los mejores productos, arma las bolsas biodegradables y marca pedidos como listos.</p>
              </div>

              <div className="bg-teal-50 border border-teal-200/80 p-4 rounded-3xl space-y-1.5 text-xs text-teal-950">
                <span className="font-extrabold text-teal-800 block text-sm">🛵 Rol Repartidor / Domiciliario</span>
                <p>Lleva el pedido con baúl térmico a casas y conjuntos de Parque Heredia, El Recreo, La Carolina, Guanabara, Villas y todo el sector.</p>
              </div>
            </div>

            {/* Staff list */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden p-5 space-y-4">
              <h3 className="font-bold text-stone-900 text-sm">Personal Registrado</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((member) => (
                  <div key={member.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">{member.name}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          member.role === 'administrador' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'tendero' ? 'bg-amber-100 text-amber-800' :
                          'bg-teal-100 text-teal-800'
                        }`}>
                          {member.role}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp: {member.phone}</span>
                      </div>

                      <p className="text-[11px] text-stone-500 mt-2">
                        {member.notes || 'Sin observaciones'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
                      <a
                        href={`https://wa.me/57${member.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-bold"
                      >
                        Abrir WhatsApp &rarr;
                      </a>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${member.name}?`)) {
                            StorageService.deleteStaff(member.id);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: CONFIGURATION & SECURITY PINS ================= */}
        {activeTab === 'config' && authRole === 'administrador' && (
          <div className="max-w-3xl space-y-5">
            <div>
              <h2 className="text-xl font-black text-stone-900 font-serif">
                Configuración de la Tienda & Seguridad
              </h2>
              <p className="text-xs text-stone-500">
                Actualiza el número de WhatsApp receptor de pedidos, datos de transferencias Nequi/Daviplata y los PINs de seguridad.
              </p>
            </div>

            <form onSubmit={handleSaveStoreConfig} className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5 text-xs">
              
              {/* SECTION 1: SECURITY PINS */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-black text-sm text-emerald-950">
                    Seguridad & PINs de Acceso al Panel
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Cada rol accede únicamente con su PIN correspondiente. Como administrador puedes cambiarlos cuando desees.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 block">PIN Administrador (Master)</label>
                    <input
                      name="adminPin"
                      type="text"
                      defaultValue={config.adminPin || '2026'}
                      required
                      placeholder="2026"
                      className="w-full p-2 bg-white border border-emerald-300 rounded-xl font-mono text-center text-sm font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 block">PIN Tendero / Alistador</label>
                    <input
                      name="tenderoPin"
                      type="text"
                      defaultValue={config.tenderoPin || '1234'}
                      required
                      placeholder="1234"
                      className="w-full p-2 bg-white border border-emerald-300 rounded-xl font-mono text-center text-sm font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 block">PIN Repartidor</label>
                    <input
                      name="repartidorPin"
                      type="text"
                      defaultValue={config.repartidorPin || '5678'}
                      required
                      placeholder="5678"
                      className="w-full p-2 bg-white border border-emerald-300 rounded-xl font-mono text-center text-sm font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: STORE & PAYMENT INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Nombre de la Tienda</label>
                  <input
                    name="storeName"
                    defaultValue={config.storeName}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">WhatsApp Receptor de Pedidos (con código 57)</label>
                  <input
                    name="whatsappNumber"
                    defaultValue={config.whatsappNumber}
                    required
                    placeholder="Ej. 573004567890"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Número de Nequi</label>
                  <input
                    name="nequiNumber"
                    defaultValue={config.nequiNumber}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Número de Daviplata</label>
                  <input
                    name="daviplataNumber"
                    defaultValue={config.daviplataNumber}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Tarifa Domicilio Estándar (COP)</label>
                  <input
                    name="defaultDeliveryFee"
                    type="number"
                    defaultValue={config.defaultDeliveryFee}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Monto para Envío Gratis (COP)</label>
                  <input
                    name="freeDeliveryThreshold"
                    type="number"
                    defaultValue={config.freeDeliveryThreshold}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-stone-100">
                <label className="font-bold text-stone-700">Título del Banner Principal (Pantalla Inicial)</label>
                <input
                  name="bannerPromoTitle"
                  defaultValue={config.bannerPromoTitle}
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Subtítulo del Banner</label>
                <textarea
                  name="bannerPromoSubtitle"
                  rows={2}
                  defaultValue={config.bannerPromoSubtitle}
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Configuración y PINs</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL: CREATE / EDIT PRODUCT ================= */}
      {isProductModalOpen && authRole === 'administrador' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-stone-900 text-base">
              {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nombre del Producto *</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  required
                  placeholder="Ej. Mango Tommy Dulce Especial"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Categoría *</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'frutas'}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  >
                    <option value="frutas">Frutas</option>
                    <option value="verduras">Verduras</option>
                    <option value="tuberculos">Tubérculos & Plátanos</option>
                    <option value="combos">Combos & Sancochos</option>
                    <option value="despensa">Despensa Básica</option>
                    <option value="hierbas_aromaticas">Hierbas Aromáticas</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Unidad de Medida *</label>
                  <select
                    name="unit"
                    defaultValue={editingProduct?.unit || 'kg'}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  >
                    <option value="kg">Kilogramo (1.000g)</option>
                    <option value="libra">Libra (500g)</option>
                    <option value="500g">500 gramos</option>
                    <option value="250g">250 gramos</option>
                    <option value="unidad">Unidad</option>
                    <option value="atado">Atado</option>
                    <option value="bandeja">Bandeja empacada</option>
                    <option value="docena">Docena</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Costo Compra (COP)</label>
                  <input
                    name="cost"
                    type="number"
                    defaultValue={editingProduct?.cost || 2000}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Precio Venta (COP)</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingProduct?.price || 3500}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Stock Inicial</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={editingProduct?.stock || 20}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingProduct?.description || ''}
                  placeholder="Detalles sobre maduración, origen, recomendación de cocina..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">URL de la Foto</label>
                <input
                  name="imageUrl"
                  defaultValue={editingProduct?.imageUrl || 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80'}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                />
              </div>

              {/* Promo Controls */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPromo"
                    name="isPromo"
                    defaultChecked={editingProduct?.isPromo ?? false}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <label htmlFor="isPromo" className="font-bold text-stone-800">
                    Destacar en Promociones del Día (Banner Principal)
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="font-semibold text-stone-600 block mb-0.5">Precio de Oferta (Opcional)</label>
                    <input
                      name="promoPrice"
                      type="number"
                      defaultValue={editingProduct?.promoPrice || ''}
                      placeholder="Ej. 2900"
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-600 block mb-0.5">Etiqueta de Promo</label>
                    <input
                      name="promoTag"
                      defaultValue={editingProduct?.promoTag || 'Oferta del Día'}
                      placeholder="Ej. 2x1 o Cosecha Fresca"
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingProduct?.isActive ?? true}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <label htmlFor="isActive" className="font-bold text-stone-800">
                  Producto activo para la venta
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: INVENTORY INFLOW ================= */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Registrar Ingreso de Mercancía</h3>

            <form onSubmit={handleAddInventoryEntry} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Seleccionar Producto *</label>
                <select
                  value={newEntry.productId}
                  onChange={(e) => {
                    const sel = products.find((p) => p.id === e.target.value);
                    setNewEntry({
                      ...newEntry,
                      productId: e.target.value,
                      purchaseCost: sel?.cost || 2000,
                      sellingPrice: sel?.price || 3500,
                    });
                  }}
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock actual: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cantidad *</label>
                  <input
                    type="number"
                    value={newEntry.quantityAdded}
                    onChange={(e) => setNewEntry({ ...newEntry, quantityAdded: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Costo Compra</label>
                  <input
                    type="number"
                    value={newEntry.purchaseCost}
                    onChange={(e) => setNewEntry({ ...newEntry, purchaseCost: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Precio Venta</label>
                  <input
                    type="number"
                    value={newEntry.sellingPrice}
                    onChange={(e) => setNewEntry({ ...newEntry, sellingPrice: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Proveedor / Origen</label>
                <input
                  type="text"
                  value={newEntry.supplier}
                  onChange={(e) => setNewEntry({ ...newEntry, supplier: e.target.value })}
                  placeholder="Ej. Mercado de Bazurto / Finca Turbaco"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Lote o Factura de Compra</label>
                <input
                  type="text"
                  value={newEntry.invoiceOrLot}
                  onChange={(e) => setNewEntry({ ...newEntry, invoiceOrLot: e.target.value })}
                  placeholder="Ej. FAC-9912 o LOTE-BAZURTO-NOV"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newEntry.productId}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  Cargar a Disponibilidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STAFF ================= */}
      {isStaffModalOpen && authRole === 'administrador' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Registrar Colaborador</h3>

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={newStaffMember.name}
                  onChange={(e) => setNewStaffMember({ ...newStaffMember, name: e.target.value })}
                  required
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Rol Operativo *</label>
                <select
                  value={newStaffMember.role}
                  onChange={(e) => setNewStaffMember({ ...newStaffMember, role: e.target.value as UserRoleType })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="tendero">Tendero / Alistador de Pedidos</option>
                  <option value="repartidor">Repartidor / Domiciliario</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">WhatsApp de Contacto *</label>
                <input
                  type="tel"
                  value={newStaffMember.phone}
                  onChange={(e) => setNewStaffMember({ ...newStaffMember, phone: e.target.value })}
                  required
                  placeholder="Ej. 3157891234"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Notas / Vehículo / Zona Asignada</label>
                <textarea
                  rows={2}
                  value={newStaffMember.notes || ''}
                  onChange={(e) => setNewStaffMember({ ...newStaffMember, notes: e.target.value })}
                  placeholder="Ej. Moto con baúl térmico para Parque Heredia..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
