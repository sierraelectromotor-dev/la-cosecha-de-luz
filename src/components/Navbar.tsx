'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Sun,
  Menu,
  X,
  Download
} from 'lucide-react';
import { StoreConfig } from '@/types';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  config: StoreConfig;
}

export default function Navbar({
  cartCount,
  cartTotal,
  onOpenCart,
  searchQuery,
  onSearchChange,
  config,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Caribbean Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-[11px] sm:text-xs py-1.5 px-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-spin-slow" />
            <span className="font-semibold text-amber-200">Sector Cartagena:</span>
            <span className="text-emerald-100 hidden sm:inline">Domicilios a casas y conjuntos en Parque Heredia, El Recreo, La Carolina, Terminal, Guanabara, Villa Estrella, Villas de la Candelaria y más.</span>
            <span className="text-emerald-100 sm:hidden">Entregas en todo el sector de Cartagena.</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a 
              href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hola La Cosecha de Luz! Quisiera información sobre pedidos a mi dirección.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-200 hover:text-white transition font-medium"
            >
              <Phone className="w-3 h-3 text-emerald-300" />
              <span>WhatsApp Tienda</span>
            </a>
            <span className="text-emerald-400">|</span>
            <Link 
              href="/admin" 
              className="flex items-center gap-1 text-amber-300 hover:text-amber-100 font-bold transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200 border border-emerald-400/30">
              <span className="text-2xl leading-none">🥑</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-emerald-950 font-serif">
                  La Cosecha <span className="text-emerald-600">de Luz</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md border border-amber-300/40">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  Minimarket
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Cartagena de Indias • Domicilios en todo el sector</span>
              </div>
            </div>
          </Link>

          {/* Search bar on desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar plátano, yuca, mango, aguacate, sancocho..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-100 hover:bg-stone-50 focus:bg-white rounded-full border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-stone-800 placeholder-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install PWA button */}
            <button
              onClick={() => {
                const event = new CustomEvent('cosecha_trigger_install');
                window.dispatchEvent(event);
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-full transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instalar en Celular</span>
            </button>

            {/* Admin shortcut button */}
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded-full transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Administración</span>
            </Link>

            {/* Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-md shadow-emerald-600/25 transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Abrir carrito"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-900 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[10px] text-emerald-100 font-medium">Mi Canasta</div>
                <div className="text-xs font-black text-amber-200">
                  ${cartTotal.toLocaleString('es-CO')}
                </div>
              </div>
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition cursor-pointer"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar en La Cosecha (ej. plátano, yuca, papaya)..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-stone-100 rounded-full border border-stone-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-stone-800"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-stone-200 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-stone-100 text-stone-800 font-semibold text-sm hover:bg-stone-200 transition"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Portal de Administración</span>
              </div>
              <span className="text-xs text-stone-500 font-normal">Gestionar tienda &rarr;</span>
            </Link>

            <a
              href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hola! Me gustaría hacer un pedido.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900 font-semibold text-sm hover:bg-emerald-100 transition"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Atención por WhatsApp</span>
              </div>
              <span className="text-xs text-emerald-700">Chatear &rarr;</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
