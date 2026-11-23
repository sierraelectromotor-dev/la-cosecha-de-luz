'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import PromoBanner from '@/components/PromoBanner';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import { Product, CartItem, ProductCategory, Order, StoreConfig } from '@/types';
import { StorageService } from '@/lib/storage';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Truck, 
  ShieldCheck, 
  HeartHandshake, 
  Phone,
  Flame,
  Award,
  Leaf
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<StoreConfig>(StorageService.getConfig());
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Load products, config and saved cart on mount & listen to storage updates
  useEffect(() => {
    const loadData = () => {
      setProducts(StorageService.getProducts());
      setConfig(StorageService.getConfig());
      setCartItems(StorageService.getCart());
    };
    loadData();

    window.addEventListener('cosecha_storage_updated', loadData);
    return () => window.removeEventListener('cosecha_storage_updated', loadData);
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      const matchesCategory = selectedCategory === 'todas' || p.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Product counts by category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = { todas: 0 };
    products.forEach((p) => {
      if (p.isActive) {
        counts.todas = (counts.todas || 0) + 1;
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Daily promo products for the banner
  const promoProducts = useMemo(() => {
    return products.filter((p) => p.isPromo && p.isActive && p.stock > 0);
  }, [products]);

  // Cart actions with persistent storage
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { product, quantity: 1 }];
      }
      StorageService.saveCart(updated);
      return updated;
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) => {
      const updated = prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
      StorageService.saveCart(updated);
      return updated;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      StorageService.saveCart(updated);
      return updated;
    });
  };

  const handleClearCart = () => {
    StorageService.clearCart();
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => {
    const p = item.product.promoPrice && item.product.isPromo ? item.product.promoPrice : item.product.price;
    return acc + p * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* PWA Install Banner & triggers */}
      <PWAInstallBanner />

      {/* Navigation Bar */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        config={config}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-6 w-full">
        {/* Hero Tropical Promo Banner */}
        <PromoBanner
          promoProducts={promoProducts}
          onAddToCart={handleAddToCart}
          title={config.bannerPromoTitle}
          subtitle={config.bannerPromoSubtitle}
        />

        {/* Value Proposition Highlights in Cartagena */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-900">Domicilios en Todo el Sector</div>
              <div className="text-stone-500 text-[11px]">Casas y conjuntos: Parque Heredia, El Recreo, La Carolina, Guanabara y más</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-900">Cosecha del Día</div>
              <div className="text-stone-500 text-[11px]">Frutas y verduras frescas seleccionadas</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-900">Atención WhatsApp</div>
              <div className="text-stone-500 text-[11px]">Confirmación rápida y fotos de tu pedido</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-900">Pagas al Recibir o Nequi</div>
              <div className="text-stone-500 text-[11px]">Total tranquilidad y garantía de calidad</div>
            </div>
          </div>
        </section>

        {/* Category Navigation & Section Title */}
        <section className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-serif flex items-center gap-2">
                <span>Catálogo de Productos Frescos</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-sans">
                  {filteredProducts.length} disponibles
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Selecciona por kilogramo, libra o por unidad. Te llega empacado a tu apartamento.
              </p>
            </div>
          </div>

          <CategoryNav
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            productCounts={productCounts}
          />
        </section>

        {/* Products Grid */}
        <section>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-bold text-stone-800 text-base">No encontramos productos con ese filtro</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Prueba buscando otro término o selecciona la categoría &quot;Todo el Minimarket&quot;.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('todas');
                  setSearchQuery('');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {filteredProducts.map((product) => {
                const itemInCart = cartItems.find((ci) => ci.product.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantityInCart={itemInCart ? itemInCart.quantity : 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Opportunity Banner: Combos Especiales de Fin de Semana / Sancocho */}
        <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-white/20 text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
              ¡Ahorra Tiempo y Dinero!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-serif">
              ¿Vas a cocinar Sancocho o preparar Jugos?
            </h3>
            <p className="text-amber-100 text-xs sm:text-sm max-w-xl">
              Nuestros combos ya vienen porcionados con la yuca suave, ñame, plátanos y hierbas exactas. No pagas de más y no te sobra nada.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('combos');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="bg-stone-900 hover:bg-black text-amber-300 font-bold px-6 py-3 rounded-2xl shadow-xl transition active:scale-95 text-xs sm:text-sm shrink-0 cursor-pointer"
          >
            Ver Combos Listos
          </button>
        </section>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        allProducts={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onAddToCart={handleAddToCart}
        config={config}
        onOrderCompleted={(order) => {
          setIsCartOpen(false);
          setCompletedOrder(order);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        config={config}
      />

      {/* Footer */}
      <footer className="mt-12 bg-stone-900 text-stone-400 text-xs border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥑</span>
              <span className="font-bold text-white text-base">La Cosecha de Luz</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              El minimarket fresco de confianza para casas, locales y conjuntos de Cartagena. Frutas, verduras y mercado entregado en tu puerta.
            </p>
            <div className="text-amber-400 font-medium text-xs">
              Parque Heredia • El Recreo • La Carolina • Guanabara • Villa Estrella • Villas de la Candelaria
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Zonas y Barrios Atendidos</h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>• Parque Heredia (Casas y Conjuntos)</li>
              <li>• Barrio El Recreo</li>
              <li>• La Carolina & Ciudadela</li>
              <li>• Sector Terminal & Guanabara</li>
              <li>• Villa Estrella & Villas de la Candelaria</li>
              <li>• Ciudad Jardín, Calicanto & Ternera</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Medios de Pago</h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>• Nequi ({config.nequiNumber})</li>
              <li>• Daviplata ({config.daviplataNumber})</li>
              <li>• Bancolombia Transferencia</li>
              <li>• Efectivo contra entrega</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Acceso a Gestión</h4>
            <p className="text-stone-400">
              Portal para alistadores de pedidos, tenderos y repartidores.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ingresar al Portal Admin</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-stone-800 py-4 text-center text-stone-500 text-[11px]">
          © 2026 La Cosecha de Luz - Minimarket Cartagena. Listo para Vercel y PWA.
        </div>
      </footer>
    </div>
  );
}
