'use client';

import { Product } from '@/types';
import { Plus, Minus, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export default function ProductCard({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
  const currentPrice = product.promoPrice && product.isPromo ? product.promoPrice : product.price;

  const getUnitDisplay = (unit: string) => {
    switch (unit) {
      case 'kg': return 'Kilo (1.000g)';
      case 'libra': return 'Libra (500g)';
      case '500g': return '500 gramos';
      case '250g': return '250 gramos';
      case 'unidad': return 'Unidad';
      case 'atado': return 'Atado fresco';
      case 'bandeja': return 'Bandeja empacada';
      case 'docena': return 'Docena (12 unids)';
      default: return unit;
    }
  };

  return (
    <div className={`group bg-white rounded-3xl p-3 sm:p-4 border border-stone-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-200 flex flex-col justify-between relative ${
      isOutOfStock ? 'opacity-65 grayscale-20' : ''
    }`}>
      {/* Top badges */}
      <div className="absolute top-3.5 left-3.5 right-3.5 sm:top-5 sm:left-5 sm:right-5 flex items-center justify-between pointer-events-none z-10">
        {product.isPromo && (
          <span className="bg-amber-400 text-stone-900 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-900" />
            <span>{product.promoTag || 'Promoción'}</span>
          </span>
        )}
        {isLowStock && !isOutOfStock && (
          <span className="bg-orange-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md ml-auto flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>¡Pocas unidades!</span>
          </span>
        )}
      </div>

      {/* Image container */}
      <div>
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-stone-100 relative mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow">
                Agotado temporalmente
              </span>
            </div>
          )}
        </div>

        {/* Category & Unit pill */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            {getUnitDisplay(product.unit)}
          </span>
          <span className="text-stone-400">
            Stock: {product.stock} disp.
          </span>
        </div>

        {/* Product Name & Description */}
        <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-emerald-800 transition line-clamp-1">
          {product.name}
        </h3>
        <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Price and Cart Controls */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-stone-900">
              ${currentPrice.toLocaleString('es-CO')}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              /{product.unit}
            </span>
          </div>
          {product.isPromo && product.promoPrice && (
            <div className="text-[11px] text-stone-400 line-through">
              ${product.price.toLocaleString('es-CO')}
            </div>
          )}
        </div>

        {/* Quantity Controls - Clean, Full-width button with zero overflow */}
        <div>
          {isOutOfStock ? (
            <div className="text-center py-1.5 text-xs text-stone-400 font-medium bg-stone-100 rounded-xl">
              Agotado
            </div>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1">
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="w-7 h-7 rounded-lg bg-white text-emerald-700 hover:bg-emerald-100 flex items-center justify-center font-bold text-sm shadow-xs transition active:scale-95 cursor-pointer"
                aria-label="Disminuir cantidad"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-emerald-950">
                {quantityInCart} en canasta
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold text-sm shadow-xs transition active:scale-95 cursor-pointer"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-2 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar a canasta</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
