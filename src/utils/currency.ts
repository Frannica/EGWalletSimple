import { Rates } from '../api/client';

// Currency decimals map (minor units). Default to 2 if unknown.
export const currencyDecimals: Record<string, number> = {
  USD: 2,
  EUR: 2,
  NGN: 2,
  XAF: 2,
  GHS: 2,
  ZAR: 2,
  CNY: 2,
};

export function decimalsFor(currency: string) {
  return currencyDecimals[currency] ?? 2;
}

export function minorToMajor(amountMinor: number, currency: string) {
  const d = decimalsFor(currency);
  return amountMinor / Math.pow(10, d);
}

export function majorToMinor(amountMajor: number, currency: string) {
  const d = decimalsFor(currency);
  return Math.round(amountMajor * Math.pow(10, d));
}

// Format an amount expressed in minor units (integer)
export function formatCurrency(amountMinor: number, currency: string, locale = undefined) {
  try {
    const major = minorToMajor(amountMinor, currency);
    return new Intl.NumberFormat(locale || undefined, { style: 'currency', currency }).format(major);
  } catch (e) {
    // fallback
    const major = minorToMajor(amountMinor, currency);
    return `${currency} ${major.toFixed(2)}`;
  }
}

// Convert an amount in minor units from `from` currency to minor units in `to` currency using rates.values[c] = units of c per 1 USD
export function convert(amountMinor: number, from: string, to: string, rates: Rates) {
  const vals = rates.values || {};
  const fromRate = vals[from] ?? 1; // units of FROM per USD
  const toRate = vals[to] ?? 1; // units of TO per USD

  // Convert minor -> major
  const fromMajor = minorToMajor(amountMinor, from);
  // Convert fromMajor to USD: usd = fromMajor / fromRate
  const usd = fromMajor / fromRate;
  // Convert USD to target major: targetMajor = usd * toRate
  const targetMajor = usd * toRate;
  // Convert major to minor for target currency
  return majorToMinor(targetMajor, to);
}
