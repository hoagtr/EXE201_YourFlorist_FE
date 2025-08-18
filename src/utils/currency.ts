export const formatCurrency = (amount: number | string | undefined | null): string => {
  const value = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(isNaN(value) ? 0 : value);
  } catch {
    return `${Math.round(isNaN(value) ? 0 : value).toLocaleString('vi-VN')} ₫`;
  }
};


