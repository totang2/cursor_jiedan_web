import { CurrencyCode, SUPPORTED_CURRENCIES } from './currency';

// 汇率缓存接口
interface ExchangeRateCache {
  rates: Record<string, number>;
  timestamp: number;
}

// 缓存过期时间（1小时）
const CACHE_EXPIRY = 60 * 60 * 1000;

// 汇率缓存
let rateCache: ExchangeRateCache | null = null;

// 获取汇率
export async function getExchangeRates(): Promise<Record<string, number>> {
  // 如果缓存存在且未过期，直接返回缓存的汇率
  if (rateCache && Date.now() - rateCache.timestamp < CACHE_EXPIRY) {
    return rateCache.rates;
  }

  try {
    // 使用 Exchange Rates API 获取最新汇率
    // 注意：需要替换为你的 API key
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );
    const data = await response.json();

    // 更新缓存
    rateCache = {
      rates: data.rates,
      timestamp: Date.now(),
    };

    return data.rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    // 如果获取失败且没有缓存，返回默认汇率（1:1）
    return Object.fromEntries(
      SUPPORTED_CURRENCIES.map(c => c.code).map(code => [code, 1])
    );
  }
}

// 转换货币
export async function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  // 如果货币相同，直接返回原始金额
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await getExchangeRates();
    
    // 将金额转换为 USD
    const amountInUSD = amount / rates[fromCurrency];
    
    // 将 USD 转换为目标货币
    return amountInUSD * rates[toCurrency];
  } catch (error) {
    console.error('Currency conversion failed:', error);
    return amount;
  }
}

// 批量转换货币
export async function convertCurrencies(
  amounts: Record<CurrencyCode, number>,
  targetCurrency: CurrencyCode
): Promise<Record<CurrencyCode, number>> {
  const rates = await getExchangeRates();
  const result: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;

  for (const [currency, amount] of Object.entries(amounts)) {
    result[currency as CurrencyCode] = await convertCurrency(
      amount,
      currency as CurrencyCode,
      targetCurrency
    );
  }

  return result;
}