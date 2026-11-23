'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Order, StoreConfig } from '@/types';
import { CheckCircle2, Phone, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  config: StoreConfig;
}

export default function OrderSuccessModal({
  order,
  onClose,
  config,
}: OrderSuccessModalProps) {
  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#f59e0b', '#fbbf24', '#ffffff'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-emerald-100 text-stone-800 relative space-y-5 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Pedido Registrado con Éxito
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
            ¡Gracias por tu compra en La Cosecha!
          </h2>
          <p className="text-xs text-stone-500">
            Tu pedido <strong className="text-stone-900 font-bold">{order.orderNumber}</strong> fue enviado a nuestro WhatsApp. En cuanto confirmemos el pago, nuestro tendero lo alista de inmediato.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500">Destino:</span>
            <span className="font-bold text-stone-900 text-right">{order.customer.complexName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500">Ubicación:</span>
            <span className="font-semibold text-stone-800">{order.customer.towerApartment}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500">Total a pagar:</span>
            <span className="font-black text-emerald-700 text-sm">
              ${order.total.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Método de pago:</span>
            <span className="font-semibold capitalize text-stone-800">
              {order.customer.paymentMethod.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Payment Reminders */}
        {order.customer.paymentMethod === 'nequi' && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 space-y-1">
            <span className="font-bold block">📲 Pago por Nequi:</span>
            <p>Envía al número: <strong className="font-bold text-indigo-950 text-sm">{config.nequiNumber}</strong> y comparte la captura en el chat de WhatsApp.</p>
          </div>
        )}

        {order.customer.paymentMethod === 'daviplata' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-1">
            <span className="font-bold block">📲 Pago por Daviplata:</span>
            <p>Envía al número: <strong className="font-bold text-red-950 text-sm">{config.daviplataNumber}</strong> y envía el comprobante en el chat.</p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <a
            href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>Abrir chat de WhatsApp de La Cosecha</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2.5 px-3 rounded-xl transition text-xs cursor-pointer text-center"
            >
              Seguir explorando
            </button>
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold text-xs px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ver en Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
