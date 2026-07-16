const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCents(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function parseToCents(value: string): number {
  const clean = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}
