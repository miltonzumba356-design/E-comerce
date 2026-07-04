import { formatCurrency } from '../utils/currency';

/**
 * Hook personalizado para formatação de moeda
 * Usa a moeda angolana (Kwanza - Kz) por padrão
 */
export function useCurrency() {
  const format = (value: number | string): string => {
    return formatCurrency(value);
  };

  const parse = (value: string): number => {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  return {
    format,
    parse,
    symbol: 'Kz',
    locale: 'pt-AO',
  };
}
