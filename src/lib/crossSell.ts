import { CartItem, Product } from '@/types';

export interface OpportunityRecommendation {
  product: Product;
  reason: string;
  badge: string;
}

export function getOpportunityRecommendations(
  cartItems: CartItem[],
  allProducts: Product[]
): OpportunityRecommendation[] {
  if (!cartItems.length) {
    // Si el carrito está vacío, recomendar los más vendidos / combos estrellas
    const starProducts = allProducts.filter((p) => p.isPromo && p.stock > 0).slice(0, 3);
    return starProducts.map((p) => ({
      product: p,
      reason: '¡Uno de los favoritos en Parque Heredia y La Carolina!',
      badge: 'Favorito del Día',
    }));
  }

  const cartProductIds = new Set(cartItems.map((ci) => ci.product.id));
  const cartCategories = new Set(cartItems.map((ci) => ci.product.category));
  const availableProducts = allProducts.filter((p) => !cartProductIds.has(p.id) && p.stock > 0 && p.isActive);

  const recommendations: OpportunityRecommendation[] = [];

  // 1. Verificar pares sugeridos explícitos de los productos en carrito
  for (const item of cartItems) {
    if (item.product.suggestedPairs) {
      for (const pairId of item.product.suggestedPairs) {
        if (!cartProductIds.has(pairId)) {
          const matchedProd = availableProducts.find((p) => p.id === pairId);
          if (matchedProd && !recommendations.some((r) => r.product.id === matchedProd.id)) {
            let reason = `Combina perfecto con tu ${item.product.name}`;
            let badge = 'Sugerencia del Día';

            if (item.product.id.includes('sancocho') || item.product.id.includes('yuca') || item.product.id.includes('name')) {
              reason = `¡Infaltable para acompañar: agrega frescura y sabor costeño!`;
              badge = 'Pareja Perfecta';
            } else if (item.product.id.includes('platano')) {
              reason = `¡Para unos patacones o tajadas doradas de ensueño!`;
              badge = 'Dúo Perfecto';
            } else if (item.product.category === 'frutas') {
              reason = `¡Ideal para acompañar tus jugos y desayunos frescos!`;
              badge = 'Desayuno Caribe';
            }

            recommendations.push({
              product: matchedProd,
              reason,
              badge,
            });
          }
        }
      }
    }
  }

  // 2. Reglas inteligentes basadas en hábitos de cocina en Cartagena
  const hasTomateOrCebolla = cartItems.some((i) => i.product.id.includes('tomate') || i.product.id.includes('cebolla'));
  const hasPlatano = cartItems.some((i) => i.product.id.includes('platano'));
  const hasFrutas = cartCategories.has('frutas');
  const hasSancochoOVerduras = cartItems.some((i) => i.product.id.includes('sancocho') || i.product.id.includes('yuca') || i.product.id.includes('name'));

  // Si lleva tomate o cebolla pero no lleva cilantro
  if (hasTomateOrCebolla && !cartProductIds.has('prod-cilantro-fresco')) {
    const cilantro = availableProducts.find((p) => p.id === 'prod-cilantro-fresco');
    if (cilantro && !recommendations.some((r) => r.product.id === cilantro.id)) {
      recommendations.push({
        product: cilantro,
        reason: '¡Lleva el atado de Cilantro fresco para coronar el mejor guiso!',
        badge: 'Por solo $1.500',
      });
    }
  }

  // Si lleva plátanos pero no lleva queso costeño
  if (hasPlatano && !cartProductIds.has('prod-queso-costeno')) {
    const queso = availableProducts.find((p) => p.id === 'prod-queso-costeno');
    if (queso && !recommendations.some((r) => r.product.id === queso.id)) {
      recommendations.push({
        product: queso,
        reason: '¡Patacón sin Queso Costeño no es patacón! Ralla este queso fresco en tu casa.',
        badge: '¡El Toque Costeño!',
      });
    }
  }

  // Si lleva sancocho/tubérculos pero no aguacate
  if (hasSancochoOVerduras && !cartProductIds.has('prod-aguacate-criollo')) {
    const aguacate = availableProducts.find((p) => p.id === 'prod-aguacate-criollo');
    if (aguacate && !recommendations.some((r) => r.product.id === aguacate.id)) {
      recommendations.push({
        product: aguacate,
        reason: '¡Un buen aguacate mantequilla es el mejor acompañamiento para tu sopa o almuerzo!',
        badge: '¡Cremoso de Hoy!',
      });
    }
  }

  // Si lleva frutas pero no avena
  if (hasFrutas && !cartProductIds.has('prod-avena-hojuelas')) {
    const avena = availableProducts.find((p) => p.id === 'prod-avena-hojuelas');
    if (avena && !recommendations.some((r) => r.product.id === avena.id)) {
      recommendations.push({
        product: avena,
        reason: '¡Licúa tus frutas con avena fría para recargar energías con el clima de Cartagena!',
        badge: 'Batido Refrescante',
      });
    }
  }

  // Si aún faltan opciones, completar con productos promocionales no agregados
  if (recommendations.length < 3) {
    const otherPromos = availableProducts.filter((p) => p.isPromo && !recommendations.some((r) => r.product.id === p.id));
    for (const p of otherPromos.slice(0, 3 - recommendations.length)) {
      recommendations.push({
        product: p,
        reason: '¡Aprovecha esta promoción del día antes de que se agote!',
        badge: p.promoTag || 'Oferta Fresca',
      });
    }
  }

  return recommendations.slice(0, 3);
}
