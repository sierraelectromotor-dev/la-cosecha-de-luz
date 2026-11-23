'use client';

import { useState, useEffect } from 'react';
import { 
  CartItem, 
  CustomerData, 
  Product, 
  StoreConfig, 
  PaymentMethod,
  Order
} from '@/types';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Phone, 
  CreditCard, 
  Building2, 
  CheckCircle, 
  AlertTriangle,
  Send,
  HelpCircle
} from 'lucide-react';
import { getOpportunityRecommendations } from '@/lib/crossSell';
import { RESIDENTIAL_COMPLEXES } from '@/lib/initialData';
import { StorageService } from '@/lib/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  allProducts: Product[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onAddToCart: (product: Product) => void;
  config: StoreConfig;
  onOrderCompleted: (order: Order) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  allProducts,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddToCart,
  config,
  onOrderCompleted,
}: CartDrawerProps) {
  // Step in checkout: 'cart' | 'checkout'
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  // Customer form state
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    phone: '',
    residentialZone: 'Parque Heredia',
    complexName: 'Parque Heredia (Casas y Conjuntos: Coral, Amaneceres, Flamingo, etc.)',
    towerApartment: '',
    notes: '',
    paymentMethod: 'nequi',
    cashAmountToPayWith: undefined,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved customer from previous orders
  useEffect(() => {
    const saved = StorageService.getCustomer();
    if (saved && typeof saved === 'object') {
      setCustomer((prev) => ({ ...prev, ...saved }));
    }
  }, []);

  // Opportunity selling recommendations based on current cart
  const recommendations = getOpportunityRecommendations(cartItems, allProducts);

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.promoPrice && item.product.isPromo 
      ? item.product.promoPrice 
      : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  // Calculate delivery fee based on selected zone
  const selectedZoneConfig = config.deliveryZones.find((z) => z.zone === customer.residentialZone);
  const deliveryFee = subtotal >= config.freeDeliveryThreshold 
    ? 0 
    : (selectedZoneConfig?.fee || config.defaultDeliveryFee);

  const total = subtotal + deliveryFee;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!customer.name.trim()) errors.name = 'Por favor ingresa tu nombre completo';
    if (!customer.phone.trim()) {
      errors.phone = 'Por favor ingresa tu número de WhatsApp';
    } else if (customer.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Ingresa un número de celular válido de 10 dígitos';
    }
    if (!customer.complexName.trim()) errors.complexName = 'Selecciona o indica tu conjunto';
    if (!customer.towerApartment.trim()) errors.towerApartment = 'Indica tu Torre y Apartamento o Manzana y Casa';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmAndSendWhatsApp = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    // Save customer preferences for next time
    StorageService.saveCustomer(customer);

    // Generate Order ID & order object
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PED-${randomSuffix}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer,
      items: cartItems.map((ci) => {
        const p = ci.product.promoPrice && ci.product.isPromo ? ci.product.promoPrice : ci.product.price;
        return {
          productId: ci.product.id,
          productName: ci.product.name,
          unit: ci.product.unit,
          price: p,
          quantity: ci.quantity,
          subtotal: p * ci.quantity,
        };
      }),
      subtotal,
      deliveryFee,
      total,
      status: 'pendiente_pago',
      paymentConfirmed: false,
      notes: customer.notes || '',
    };

    // Save order in local database
    StorageService.saveOrder(newOrder);

    // Build the formatted WhatsApp message
    let message = `🛒 *NUEVO PEDIDO EN LA COSECHA DE LUZ* 🛒\n`;
    message += `📋 *Pedido:* ${newOrder.orderNumber}\n`;
    message += `📅 *Fecha:* ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}\n\n`;

    message += `👤 *DATOS DEL CLIENTE:*\n`;
    message += `• *Nombre:* ${customer.name}\n`;
    message += `• *WhatsApp:* ${customer.phone}\n`;
    message += `• *Barrio / Sector:* ${customer.complexName}\n`;
    message += `• *Dirección:* ${customer.towerApartment}\n`;
    if (customer.notes) {
      message += `• *Instrucciones:* ${customer.notes}\n`;
    }
    message += `\n📦 *PRODUCTOS SOLICITADOS:*\n`;

    newOrder.items.forEach((item, index) => {
      message += `${index + 1}. ${item.productName} (${item.quantity} x ${item.unit}) -> $${item.subtotal.toLocaleString('es-CO')}\n`;
    });

    message += `\n💵 *RESUMEN DE PAGO:*\n`;
    message += `• *Subtotal Productos:* $${subtotal.toLocaleString('es-CO')}\n`;
    message += `• *Domicilio (${customer.residentialZone}):* $${deliveryFee.toLocaleString('es-CO')}\n`;
    message += `• *TOTAL A PAGAR:* $${total.toLocaleString('es-CO')}\n\n`;

    message += `💳 *MÉTODO DE PAGO:* `;
    if (customer.paymentMethod === 'nequi') {
      message += `Nequi (${config.nequiNumber})\n_Adjunto comprobante o confirmo pago por aquí_\n`;
    } else if (customer.paymentMethod === 'daviplata') {
      message += `Daviplata (${config.daviplataNumber})\n_Adjunto comprobante o confirmo pago por aquí_\n`;
    } else if (customer.paymentMethod === 'bancolombia') {
      message += `Bancolombia ${config.bancolombiaType} (${config.bancolombiaAccount})\n`;
    } else {
      message += `Efectivo contra entrega`;
      if (customer.cashAmountToPayWith) {
        message += ` (Pago con: $${customer.cashAmountToPayWith.toLocaleString('es-CO')}, llevar cambio)\n`;
      } else {
        message += `\n`;
      }
    }

    message += `\n📍 *Por favor confírmenme el pedido y tiempo estimado de entrega.* ¡Muchas gracias!`;

    // WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = config.whatsappNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    // Clear cart and notify
    onClearCart();
    setIsSubmitting(false);
    onOrderCompleted(newOrder);

    // Open WhatsApp
    window.open(waUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300" 
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 overflow-x-hidden">
          {/* Drawer Header */}
          <div className="p-3.5 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between border-b border-emerald-700/50 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm sm:text-lg leading-tight truncate">
                  {step === 'cart' ? 'Tu Canasta de Frescura' : 'Datos de Entrega'}
                </h2>
                <p className="text-[11px] sm:text-xs text-emerald-200 truncate">
                  {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} seleccionados
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition cursor-pointer shrink-0"
              aria-label="Cerrar canasta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-4xl">
                  🛒
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-800 text-lg">Tu canasta está vacía</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Agrega plátanos, yuca fresca, frutas tropicales o un combo de sancocho para tu almuerzo.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition"
                >
                  Ver productos de la cosecha
                </button>
              </div>
            ) : step === 'cart' ? (
              <>
                {/* Free Delivery Progress Bar */}
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-xs">
                  {subtotal >= config.freeDeliveryThreshold ? (
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>¡Felicitaciones! Tienes ENVÍO GRATIS a tu conjunto residencial.</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-stone-700 font-medium mb-1.5">
                        <span>Envío gratis desde ${config.freeDeliveryThreshold.toLocaleString('es-CO')}</span>
                        <span className="font-bold text-emerald-700">
                          Faltan ${(config.freeDeliveryThreshold - subtotal).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (subtotal / config.freeDeliveryThreshold) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <span>Productos</span>
                    <button
                      onClick={onClearCart}
                      className="text-stone-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vaciar</span>
                    </button>
                  </div>

                  {cartItems.map((item) => {
                    const price = item.product.promoPrice && item.product.isPromo
                      ? item.product.promoPrice
                      : item.product.price;
                    const itemTotal = price * item.quantity;

                    return (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-stone-50 border border-stone-200/80 hover:bg-white transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                        />

                        <div className="flex-1 min-w-0 pr-1">
                          <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-[11px] text-stone-500">
                            ${price.toLocaleString('es-CO')} / {item.product.unit}
                          </div>
                          <div className="text-xs font-black text-emerald-800 mt-0.5">
                            Total: ${itemTotal.toLocaleString('es-CO')}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 shrink-0 shadow-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition active:scale-95"
                            aria-label="Disminuir"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer transition active:scale-95"
                            aria-label="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SMART OPPORTUNITY SELLING WIDGET (Venta por Oportunidad) */}
                {recommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl p-4 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>¡Combina perfecto con tu canasta!</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Clientes de Parque Heredia y La Carolina que llevan lo que tienes en tu carrito, suelen agregar también:
                    </p>

                    <div className="space-y-2.5">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.product.id}
                          className="bg-white rounded-2xl p-2.5 border border-amber-200/60 shadow-xs flex items-center justify-between gap-3 hover:border-amber-400 transition"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={rec.product.imageUrl}
                            alt={rec.product.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-stone-900 text-xs truncate">
                                {rec.product.name}
                              </span>
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-md">
                                {rec.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-amber-800 font-medium line-clamp-1 mt-0.5">
                              {rec.reason}
                            </p>
                            <div className="text-xs font-black text-stone-900 mt-0.5">
                              ${(rec.product.promoPrice || rec.product.price).toLocaleString('es-CO')}
                              <span className="text-[10px] font-normal text-stone-400"> /{rec.product.unit}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onAddToCart(rec.product)}
                            className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Sumar</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Step 2: Customer Delivery & Payment Data */
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-emerald-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Entrega a domicilio en todo el sector</strong>
                    <span className="text-[11px] text-emerald-700">
                      Entregamos en casas, conjuntos residenciales y locales de Parque Heredia, El Recreo, La Carolina, Terminal, Guanabara, Villa Estrella, Villas de la Candelaria y más.
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Nombre Completo *</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Ej. Paola Gómez"
                    className={`w-full p-2.5 rounded-xl border text-stone-800 bg-stone-50 focus:bg-white outline-none transition ${
                      formErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-500">{formErrors.name}</p>}
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Número de WhatsApp *</span>
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Ej. 301 555 1234"
                    className={`w-full p-2.5 rounded-xl border text-stone-800 bg-stone-50 focus:bg-white outline-none transition ${
                      formErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.phone && <p className="text-[11px] text-rose-500">{formErrors.phone}</p>}
                </div>

                {/* Barrio / Sector Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Barrio, Sector o Urbanización *</span>
                  </label>
                  <select
                    value={customer.complexName}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const foundZone = RESIDENTIAL_COMPLEXES.find((rc) => rc.name === selectedVal);
                      setCustomer({
                        ...customer,
                        complexName: selectedVal,
                        residentialZone: foundZone ? foundZone.zone : 'Otro Sector Cercano',
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-stone-800 bg-stone-50 focus:bg-white outline-none transition cursor-pointer"
                  >
                    {RESIDENTIAL_COMPLEXES.map((rc, idx) => (
                      <option key={idx} value={rc.name}>
                        {rc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dirección exacta */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Dirección exacta (Calle, Manzana y Casa, o Torre/Apto) *</label>
                  <input
                    type="text"
                    value={customer.towerApartment}
                    onChange={(e) => setCustomer({ ...customer, towerApartment: e.target.value })}
                    placeholder="Ej. Manzana 14 Casa 8  /  Calle 32 #15-20  /  Torre 4 Apto 702"
                    className={`w-full p-2.5 rounded-xl border text-stone-800 bg-stone-50 focus:bg-white outline-none transition ${
                      formErrors.towerApartment ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.towerApartment && (
                    <p className="text-[11px] text-rose-500">{formErrors.towerApartment}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2 pt-1">
                  <label className="font-bold text-stone-700 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¿Cómo deseas pagar?</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'nequi', label: 'Nequi', note: config.nequiNumber },
                      { id: 'daviplata', label: 'Daviplata', note: config.daviplataNumber },
                      { id: 'bancolombia', label: 'Bancolombia', note: 'Transferencia' },
                      { id: 'efectivo_contraentrega', label: 'Efectivo', note: 'Contra entrega' },
                    ].map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setCustomer({ ...customer, paymentMethod: pm.id as PaymentMethod })}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          customer.paymentMethod === pm.id
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="font-bold">{pm.label}</div>
                        <div className="text-[10px] text-stone-500">{pm.note}</div>
                      </button>
                    ))}
                  </div>

                  {customer.paymentMethod === 'efectivo_contraentrega' && (
                    <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        ¿Con cuánto vas a pagar? (para que el domiciliario lleve tu cambio):
                      </label>
                      <input
                        type="number"
                        placeholder="Ej. 50000"
                        value={customer.cashAmountToPayWith || ''}
                        onChange={(e) => setCustomer({ ...customer, cashAmountToPayWith: Number(e.target.value) || undefined })}
                        className="w-full p-2 bg-white rounded-lg border border-amber-300 text-stone-900 text-xs outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Instrucciones de Entrega (Opcional)</label>
                  <textarea
                    rows={2}
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    placeholder="Ej. Dejar en recepción de portería, o timbrar al citófono 702..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-stone-800 bg-stone-50 focus:bg-white outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer with Totals and Action Buttons */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3">
              {/* Cost breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal productos:</span>
                  <span className="font-semibold text-stone-900">${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="truncate pr-2">
                    Domicilio ({customer.residentialZone}):
                  </span>
                  <span className={`font-semibold shrink-0 ${deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'text-stone-900'}`}>
                    {deliveryFee === 0 ? 'GRATIS' : `$${deliveryFee.toLocaleString('es-CO')}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-stone-900 pt-1.5 border-t border-stone-200">
                  <span>Total estimado:</span>
                  <span className="text-emerald-800 shrink-0">${total.toLocaleString('es-CO')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>Continuar a Datos de Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleConfirmAndSendWhatsApp}
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Send className="w-4 h-4 fill-white" />
                    <span>Enviar Pedido a WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setStep('cart')}
                    className="w-full text-stone-500 hover:text-stone-800 text-xs py-1 transition cursor-pointer text-center"
                  >
                    &larr; Volver a revisar canasta
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
