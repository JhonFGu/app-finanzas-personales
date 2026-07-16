export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  digits: number;
}

export const latinAmericanCurrencies: CurrencyConfig[] = [
  { code: 'COP', name: 'Colombia (Peso COP)', symbol: '$', locale: 'es-CO', digits: 0 },
  { code: 'MXN', name: 'México (Peso MXN)', symbol: '$', locale: 'es-MX', digits: 2 },
  { code: 'ARS', name: 'Argentina (Peso ARS)', symbol: '$', locale: 'es-AR', digits: 2 },
  { code: 'CLP', name: 'Chile (Peso CLP)', symbol: '$', locale: 'es-CL', digits: 0 },
  { code: 'PEN', name: 'Perú (Sol PEN)', symbol: 'S/', locale: 'es-PE', digits: 2 },
  { code: 'BRL', name: 'Brasil (Real BRL)', symbol: 'R$', locale: 'pt-BR', digits: 2 },
  { code: 'USD', name: 'Ecuador / Panamá (Dólar USD)', symbol: '$', locale: 'en-US', digits: 2 },
  { code: 'UYU', name: 'Uruguay (Peso UYU)', symbol: '$U', locale: 'es-UY', digits: 2 },
  { code: 'CRC', name: 'Costa Rica (Colón CRC)', symbol: '₡', locale: 'es-CR', digits: 2 },
  { code: 'GTQ', name: 'Guatemala (Quetzal GTQ)', symbol: 'Q', locale: 'es-GT', digits: 2 },
  { code: 'HNL', name: 'Honduras (Lempira HNL)', symbol: 'L', locale: 'es-HN', digits: 2 },
  { code: 'NIO', name: 'Nicaragua (Córdoba NIO)', symbol: 'C$', locale: 'es-NI', digits: 2 },
  { code: 'PYG', name: 'Paraguay (Guaraní PYG)', symbol: '₲', locale: 'es-PY', digits: 0 },
  { code: 'VES', name: 'Venezuela (Bolívar VES)', symbol: 'Bs.S', locale: 'es-VE', digits: 2 },
  { code: 'DOP', name: 'República Dominicana (Peso DOP)', symbol: 'RD$', locale: 'es-DO', digits: 2 },
];

export function getSelectedCurrency(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('finwise_user_currency') || 'COP';
  }
  return 'COP';
}

export function formatCents(cents: number): string {
  const code = getSelectedCurrency();
  const config = latinAmericanCurrencies.find(c => c.code === code) || latinAmericanCurrencies[0];
  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.digits,
    maximumFractionDigits: config.digits,
  });
  return formatter.format(cents / 100);
}

export function parseToCents(value: string): number {
  const clean = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}
