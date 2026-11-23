'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Sparkles, ShoppingCart, Clock, ChevronRight, ChevronLeft, Flame, Tag } from 'lucide-react';

interface PromoBannerProps {
  promoProducts: Product[];
  onAddToCart: (product: Product) => void;
  title?: string;
  subtitle?: string;
}

export default function PromoBanner({
  promoProducts,
  onAddToCart,
  title = '¡Cosecha Fresca a tu Puerta!',
  subtitle = 'Frutas y verduras seleccionadas a mano, directo a casas y conjuntos en Parque Heredia, El Recreo, La Carolina, Terminal, Guanabara, Villa Estrella, Villas de la Candelaria y todo el sector.',
}: PromoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (promoProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoProducts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [promoProducts.length]);

  if (!promoProducts.length) return null;

  const currentPromo = promoProducts[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/30">
      {/* Decorative Tropical Circles & Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-7 lg:p-9 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Tropical Banner Copy & Promotion Details */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-amber-400 text-stone-900 font-extrabold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
              <span>Promociones del Día</span>
            </span>

            <span className="inline-flex items-center gap-1 bg-emerald-800/80 text-emerald-200 text-xs px-2.5 py-1 rounded-full border border-emerald-600/40 font-medium">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Entrega express en tu conjunto</span>
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight font-serif">
              {title}
            </h1>
            <p className="text-emerald-200/90 text-sm sm:text-base mt-1.5 leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </div>

          {/* Highlight Card for Current Promo Item */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {currentPromo.promoTag || 'Oferta destacada'}
                </span>
                <span className="text-[11px] text-emerald-300">
                  • Venta por {currentPromo.unit}
                </span>
              </div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                {currentPromo.name}
              </h3>
              <p className="text-xs text-emerald-100/80 line-clamp-2 max-w-md">
                {currentPromo.description}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-black text-amber-300">
                  ${(currentPromo.promoPrice || currentPromo.price).toLocaleString('es-CO')}
                </div>
                {currentPromo.promoPrice && (
                  <div className="text-xs text-emerald-300 line-through">
                    ${currentPromo.price.toLocaleString('es-CO')}
                  </div>
                )}
              </div>

              <button
                onClick={() => onAddToCart(currentPromo)}
                className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Agregar combo</span>
              </button>
            </div>
          </div>

          {/* Carousel dots and arrows */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {promoProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-7 bg-amber-400'
                      : 'w-2 bg-emerald-700/60 hover:bg-emerald-600'
                  }`}
                  aria-label={`Ver promoción ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 text-xs text-emerald-300">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + promoProducts.length) % promoProducts.length)}
                className="p-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/80 text-white transition cursor-pointer"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold px-1">
                {currentIndex + 1} de {promoProducts.length}
              </span>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % promoProducts.length)}
                className="p-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/80 text-white transition cursor-pointer"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Product Presentation with tropical flair */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-sm aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPromo.imageUrl}
              alt={currentPromo.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Badge on image */}
            <div className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Garantía de Frescura Hoy</span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-left">
              <div className="text-white text-xs font-semibold">
                Llega empacado y listo para cocinar en:
              </div>
              <div className="text-amber-300 text-xs font-bold">
                Parque Heredia • El Recreo • La Carolina • Guanabara • Villas y más
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
