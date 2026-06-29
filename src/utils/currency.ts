/**
 * Currency conversion utilities for affiliate products
 * Auto-converts all currencies to GBP using Google's exchange rates
 */

export interface CurrencyRate {
  code: string;
  symbol: string;
  rate: number; // Rate to convert FROM this currency TO GBP
  name: string;
}

// Fallback exchange rates (updated periodically) - all convert TO GBP
const FALLBACK_RATES: Record<string, CurrencyRate> = {
  GBP: { code: 'GBP', symbol: '£', rate: 1, name: 'British Pound' },
  USD: { code: 'USD', symbol: '$', rate: 0.79, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.86, name: 'Euro' },
  
  // Major currencies
  JPY: { code: 'JPY', symbol: '¥', rate: 0.0052, name: 'Japanese Yen' },
  CNY: { code: 'CNY', symbol: '¥', rate: 0.11, name: 'Chinese Yuan' },
  CHF: { code: 'CHF', symbol: 'Fr', rate: 0.88, name: 'Swiss Franc' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 0.58, name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 0.51, name: 'Australian Dollar' },
  NZD: { code: 'NZD', symbol: 'NZ$', rate: 0.47, name: 'New Zealand Dollar' },
  
  // European currencies
  NOK: { code: 'NOK', symbol: 'kr', rate: 0.074, name: 'Norwegian Krone' },
  SEK: { code: 'SEK', symbol: 'kr', rate: 0.075, name: 'Swedish Krona' },
  DKK: { code: 'DKK', symbol: 'kr', rate: 0.115, name: 'Danish Krone' },
  PLN: { code: 'PLN', symbol: 'zł', rate: 0.20, name: 'Polish Złoty' },
  CZK: { code: 'CZK', symbol: 'Kč', rate: 0.034, name: 'Czech Koruna' },
  HUF: { code: 'HUF', symbol: 'Ft', rate: 0.0021, name: 'Hungarian Forint' },
  
  // Asian currencies
  INR: { code: 'INR', symbol: '₹', rate: 0.0095, name: 'Indian Rupee' },
  KRW: { code: 'KRW', symbol: '₩', rate: 0.00059, name: 'South Korean Won' },
  THB: { code: 'THB', symbol: '฿', rate: 0.022, name: 'Thai Baht' },
  SGD: { code: 'SGD', symbol: 'S$', rate: 0.58, name: 'Singapore Dollar' },
  MYR: { code: 'MYR', symbol: 'RM', rate: 0.17, name: 'Malaysian Ringgit' },
  IDR: { code: 'IDR', symbol: 'Rp', rate: 0.000051, name: 'Indonesian Rupiah' },
  PHP: { code: 'PHP', symbol: '₱', rate: 0.014, name: 'Philippine Peso' },
  VND: { code: 'VND', symbol: '₫', rate: 0.000033, name: 'Vietnamese Dong' },
  
  // Middle East & Africa
  AED: { code: 'AED', symbol: 'د.إ', rate: 0.21, name: 'UAE Dirham' },
  SAR: { code: 'SAR', symbol: '﷼', rate: 0.21, name: 'Saudi Riyal' },
  ILS: { code: 'ILS', symbol: '₪', rate: 0.21, name: 'Israeli Shekel' },
  TRY: { code: 'TRY', symbol: '₺', rate: 0.024, name: 'Turkish Lira' },
  EGP: { code: 'EGP', symbol: '£', rate: 0.016, name: 'Egyptian Pound' },
  ZAR: { code: 'ZAR', symbol: 'R', rate: 0.043, name: 'South African Rand' },
  
  // African currencies
  NGN: { code: 'NGN', symbol: '₦', rate: 0.00049, name: 'Nigerian Naira' },
  KES: { code: 'KES', symbol: 'KSh', rate: 0.0061, name: 'Kenyan Shilling' },
  GHS: { code: 'GHS', symbol: '₵', rate: 0.052, name: 'Ghanaian Cedi' },
  UGX: { code: 'UGX', symbol: 'USh', rate: 0.00021, name: 'Ugandan Shilling' },
  TZS: { code: 'TZS', symbol: 'TSh', rate: 0.00033, name: 'Tanzanian Shilling' },
  ETB: { code: 'ETB', symbol: 'Br', rate: 0.014, name: 'Ethiopian Birr' },
  MAD: { code: 'MAD', symbol: 'DH', rate: 0.078, name: 'Moroccan Dirham' },
  
  // Latin American currencies
  BRL: { code: 'BRL', symbol: 'R$', rate: 0.16, name: 'Brazilian Real' },
  MXN: { code: 'MXN', symbol: '$', rate: 0.039, name: 'Mexican Peso' },
  ARS: { code: 'ARS', symbol: '$', rate: 0.00081, name: 'Argentine Peso' },
  CLP: { code: 'CLP', symbol: '$', rate: 0.00082, name: 'Chilean Peso' },
  COP: { code: 'COP', symbol: '$', rate: 0.00019, name: 'Colombian Peso' },
  PEN: { code: 'PEN', symbol: 'S/', rate: 0.21, name: 'Peruvian Sol' },
  
  // Other important currencies
  RUB: { code: 'RUB', symbol: '₽', rate: 0.0084, name: 'Russian Ruble' },
  UAH: { code: 'UAH', symbol: '₴', rate: 0.019, name: 'Ukrainian Hryvnia' },
  BTC: { code: 'BTC', symbol: '₿', rate: 32000, name: 'Bitcoin' }, // Approximate
  ETH: { code: 'ETH', symbol: 'Ξ', rate: 1800, name: 'Ethereum' }, // Approximate
};

/**
 * Get currency information
 */
export function getCurrencyInfo(code: string): CurrencyRate | null {
  return FALLBACK_RATES[code.toUpperCase()] || null;
}

/**
 * Fetch live exchange rate using multiple reliable APIs
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code (default: GBP)
 * @returns Exchange rate or null if failed
 */
export async function fetchGoogleExchangeRate(
  fromCurrency: string, 
  toCurrency: string = 'GBP'
): Promise<number | null> {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return 1;
  }

  console.log(`🔄 Fetching live rate: ${fromCurrency} → ${toCurrency}`);

  const endpoints = [
    // Multiple reliable, free APIs for better coverage
    {
      url: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}.json`,
      parser: (data: any) => data[fromCurrency.toLowerCase()]?.[toCurrency.toLowerCase()],
      name: 'fawazahmed0'
    },
    {
      url: `https://api.exchangerate-api.com/v4/latest/${fromCurrency.toUpperCase()}`,
      parser: (data: any) => data.rates?.[toCurrency.toUpperCase()],
      name: 'exchangerate-api'
    },
    {
      url: `https://open.er-api.com/v6/latest/${fromCurrency.toUpperCase()}`,
      parser: (data: any) => data.rates?.[toCurrency.toUpperCase()],
      name: 'open.er-api'
    },
    {
      url: `https://api.fxratesapi.com/latest?base=${fromCurrency.toUpperCase()}&symbols=${toCurrency.toUpperCase()}`,
      parser: (data: any) => data.rates?.[toCurrency.toUpperCase()],
      name: 'fxratesapi'
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Trying ${endpoint.name}: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, { 
        signal: AbortSignal.timeout(10000), // Increased timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; PreparednessForWar/1.0)'
        },
        mode: 'cors'
      });
      
      console.log(`📊 ${endpoint.name} response: ${response.status}`);
      
      if (!response.ok) {
        console.warn(`❌ ${endpoint.name} HTTP ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`📈 ${endpoint.name} data:`, data);
      
      const rate = endpoint.parser(data);
      console.log(`🔍 Extracted rate from ${endpoint.name}:`, rate);
      
      if (typeof rate === 'number' && rate > 0) {
        console.log(`✅ SUCCESS: ${fromCurrency} → ${toCurrency} = ${rate} (via ${endpoint.name})`);
        return rate;
      }
      
      console.warn(`⚠️ Invalid rate from ${endpoint.name}:`, rate);
    } catch (error) {
      console.warn(`❌ ${endpoint.name} failed:`, error);
    }
  }

  console.warn(`🚫 ALL APIs failed for ${fromCurrency}→${toCurrency}`);
  return null;
}

/**
 * Alternative exchange rate API with better error handling
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Exchange rate or null if failed
 */
export async function fetchGoogleSearchRate(
  fromCurrency: string,
  toCurrency: string = 'GBP'
): Promise<number | null> {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return 1;
  }

  const backupApis = [
    {
      url: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}/${toCurrency.toLowerCase()}.json`,
      parser: (data: any) => data[toCurrency.toLowerCase()],
      name: 'fawazahmed0-direct'
    },
    {
      url: `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_Qh2jE8nBSv3F7T9kR4dXyM1pL6wN0oC&base_currency=${fromCurrency.toUpperCase()}&currencies=${toCurrency.toUpperCase()}`,
      parser: (data: any) => data.data?.[toCurrency.toUpperCase()],
      name: 'freecurrencyapi'
    },
    {
      url: `https://api.currencylayer.com/live?access_key=free&source=${fromCurrency.toUpperCase()}&currencies=${toCurrency.toUpperCase()}`,
      parser: (data: any) => data.quotes?.[`${fromCurrency.toUpperCase()}${toCurrency.toUpperCase()}`],
      name: 'currencylayer'
    }
  ];

  for (const api of backupApis) {
    try {
      console.log(`🔄 Backup API ${api.name}: ${api.url}`);
      
      const response = await fetch(api.url, { 
        signal: AbortSignal.timeout(8000),
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        console.warn(`❌ ${api.name} HTTP ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const rate = api.parser(data);
      
      if (typeof rate === 'number' && rate > 0) {
        console.log(`✅ Backup API success: ${fromCurrency} → ${toCurrency} = ${rate} (via ${api.name})`);
        return rate;
      }
    } catch (error) {
      console.warn(`❌ Backup ${api.name} failed:`, error);
    }
  }

  return null;
}

/**
 * Convert any currency to GBP using live rates with fallback
 * @param amount - Amount in the source currency
 * @param fromCurrency - Source currency code
 * @returns Amount converted to GBP
 */
export async function convertToGBPWithGoogle(
  amount: number, 
  fromCurrency: string
): Promise<{ amount: number; usedLiveRate: boolean }> {
  if (!amount || amount <= 0) return { amount: 0, usedLiveRate: false };
  
  const fromCode = fromCurrency.toUpperCase();
  if (fromCode === 'GBP') return { amount, usedLiveRate: false };
  
  console.log(`convertToGBPWithGoogle: Converting ${amount} ${fromCode} to GBP`);
  
  // Try live exchange rates first
  let rate = await fetchGoogleExchangeRate(fromCode, 'GBP');
  let usedLiveRate = !!rate;
  
  if (!rate) {
    console.log(`convertToGBPWithGoogle: Primary API failed, trying backup...`);
    rate = await fetchGoogleSearchRate(fromCode, 'GBP');
    usedLiveRate = !!rate;
  }
  
  // Fallback to stored rates if all APIs fail
  if (!rate) {
    console.log(`convertToGBPWithGoogle: All APIs failed, using fallback rates`);
    const fallbackCurrency = getCurrencyInfo(fromCode);
    rate = fallbackCurrency?.rate || 1;
    usedLiveRate = false;
    console.warn(`Using fallback rate for ${fromCode}→GBP: ${rate}`);
  }
  
  const gbpAmount = amount * rate;
  const roundedAmount = Math.round(gbpAmount * 100) / 100;
  
  console.log(`convertToGBPWithGoogle: Final result: ${amount} ${fromCode} = ${roundedAmount} GBP (${usedLiveRate ? 'live' : 'fallback'} rate: ${rate})`);
  
  return { 
    amount: roundedAmount, 
    usedLiveRate 
  };
}

/**
 * Synchronous conversion using fallback rates only
 * @param amount - Amount in the source currency
 * @param fromCurrency - Source currency code
 * @returns Amount converted to GBP
 */
export function convertToGBP(amount: number, fromCurrency: string): number {
  if (!amount || amount <= 0) return 0;
  
  const from = getCurrencyInfo(fromCurrency);
  if (!from) return amount; // Return original if currency not supported
  
  // Convert to GBP
  const gbpAmount = amount * from.rate;
  return Math.round(gbpAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Format amount in GBP with £ symbol
 * @param amount - Amount to format (assumed to be in GBP)
 * @param options - Formatting options
 */
export function formatGBP(
  amount: number, 
  options: {
    decimals?: number;
    locale?: string;
  } = {}
): string {
  const { decimals = 2, locale = 'en-GB' } = options;
  
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  
  return `£${formattedAmount}`;
}

/**
 * Fetch live exchange rates from multiple Google-based sources
 */
export async function fetchLiveRatesToGBP(): Promise<Record<string, number> | null> {
  try {
    const supportedCurrencies = Object.keys(FALLBACK_RATES).filter(code => code !== 'GBP');
    const ratesToGBP: Record<string, number> = { GBP: 1 };
    
    // Try to get rates for each currency
    for (const currency of supportedCurrencies) {
      const rate = await fetchGoogleExchangeRate(currency, 'GBP');
      if (rate) {
        ratesToGBP[currency] = rate;
      }
    }
    
    // Return rates if we got at least some, otherwise null
    return Object.keys(ratesToGBP).length > 1 ? ratesToGBP : null;
  } catch (error) {
    console.warn('Failed to fetch live exchange rates:', error);
    return null;
  }
}

/**
 * Convert and format a price to GBP for display (async version with live rates)
 * @param price - Original price
 * @param originalCurrency - Original currency code
 * @returns Object with converted amount and formatted string in GBP
 */
export async function convertAndFormatPriceToGBPAsync(
  price: number | null | undefined, 
  originalCurrency: string
): Promise<{
  amount: number;
  formatted: string;
  originalPrice: number | null;
  originalCurrency: string;
  isConverted: boolean;
  usedGoogleRate: boolean;
}> {
  console.log(`convertAndFormatPriceToGBPAsync: Input - price: ${price}, currency: ${originalCurrency}`);
  
  if (!price || price <= 0) {
    console.log(`convertAndFormatPriceToGBPAsync: No valid price provided`);
    return {
      amount: 0,
      formatted: 'Price on site',
      originalPrice: null,
      originalCurrency,
      isConverted: false,
      usedGoogleRate: false
    };
  }
  
  const fromCode = originalCurrency.toUpperCase();
  let gbpAmount = price;
  let usedGoogleRate = false;
  
  if (fromCode !== 'GBP') {
    console.log(`convertAndFormatPriceToGBPAsync: Converting from ${fromCode} to GBP`);
    const conversionResult = await convertToGBPWithGoogle(price, originalCurrency);
    gbpAmount = conversionResult.amount;
    usedGoogleRate = conversionResult.usedLiveRate;
    console.log(`convertAndFormatPriceToGBPAsync: Conversion result - ${gbpAmount} GBP, used live rate: ${usedGoogleRate}`);
  } else {
    console.log(`convertAndFormatPriceToGBPAsync: Already in GBP, no conversion needed`);
  }
  
  const roundedAmount = Math.round(gbpAmount * 100) / 100;
  const formatted = formatGBP(roundedAmount);
  const isConverted = fromCode !== 'GBP';
  
  const result = {
    amount: roundedAmount,
    formatted,
    originalPrice: price,
    originalCurrency,
    isConverted,
    usedGoogleRate
  };
  
  console.log(`convertAndFormatPriceToGBPAsync: Final result:`, result);
  return result;
}

/**
 * Convert and format a price to GBP for display (sync version with fallback rates)
 * @param price - Original price
 * @param originalCurrency - Original currency code
 * @returns Object with converted amount and formatted string in GBP
 */
export function convertAndFormatPriceToGBP(
  price: number | null | undefined, 
  originalCurrency: string
): {
  amount: number;
  formatted: string;
  originalPrice: number | null;
  originalCurrency: string;
  isConverted: boolean;
} {
  if (!price || price <= 0) {
    return {
      amount: 0,
      formatted: 'Price on site',
      originalPrice: null,
      originalCurrency,
      isConverted: false
    };
  }
  
  const gbpAmount = convertToGBP(price, originalCurrency);
  const formatted = formatGBP(gbpAmount);
  const isConverted = originalCurrency.toUpperCase() !== 'GBP';
  
  return {
    amount: gbpAmount,
    formatted,
    originalPrice: price,
    originalCurrency,
    isConverted
  };
}

// Legacy function for backward compatibility - now always returns GBP
export function convertAndFormatPrice(
  price: number | null | undefined, 
  originalCurrency: string, 
  displayCurrency?: string // Ignored - always converts to GBP
): {
  amount: number;
  formatted: string;
  currency: string;
  isConverted: boolean;
} {
  const result = convertAndFormatPriceToGBP(price, originalCurrency);
  
  return {
    amount: result.amount,
    formatted: result.formatted,
    currency: 'GBP',
    isConverted: result.isConverted
  };
}

// Legacy functions - kept for compatibility but no longer used
export function getPreferredCurrency(): string { return 'GBP'; }
export function setPreferredCurrency(currencyCode: string): void { /* No-op */ }
export const DISPLAY_CURRENCIES = ['GBP']; // Only GBP now