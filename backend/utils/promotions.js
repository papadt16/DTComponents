export function isPromoValidNow(promo) {
  const now = new Date();
  if (!promo.active) return false;
  if (promo.startDate && now < new Date(promo.startDate)) return false;
  if (promo.endDate && now > new Date(promo.endDate)) return false;
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) return false;
  return true;
}

export function computeDiscount(promo, subtotal) {
  if (promo.discountType === "percentage") {
    return Math.round(subtotal * (promo.discountValue / 100));
  }
  return Math.min(promo.discountValue, subtotal);
}
