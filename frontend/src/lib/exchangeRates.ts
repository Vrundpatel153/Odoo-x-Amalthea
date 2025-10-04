import { ExchangeRate } from './types';
import { storage } from './storage';

/**
 * Mock exchange rate service
 * In production, this would call a real API like exchangerate-api.com
 */
export class ExchangeRateService {
  private static TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  // Base rates cache by base currency response (full table), 12h TTL
  private static BASE_CACHE_KEY = 'ems_exchange_base_tables';

  /**
   * Get exchange rate from cache or fetch new one
   */
  static async getRate(from: string, to: string): Promise<ExchangeRate> {
    if (from === to) {
      return {
        from,
        to,
        rate: 1.0,
        timestamp: new Date().toISOString(),
        ttl: this.TTL,
      };
    }

    // Check cache
    const rates = storage.getExchangeRates();
    const cached = rates.find(r => r.from === from && r.to === to);
    
    if (cached) {
      const age = Date.now() - new Date(cached.timestamp).getTime();
      if (age < cached.ttl) {
        return cached;
      }
    }

  // Fetch new rate using real API with caching of base tables
  const rate = await this.fetchRate(from, to);
    
    // Update cache
    const newRate: ExchangeRate = {
      from,
      to,
      rate,
      timestamp: new Date().toISOString(),
      ttl: this.TTL,
    };

    const updatedRates = rates.filter(r => !(r.from === from && r.to === to));
    updatedRates.push(newRate);
    storage.setExchangeRates(updatedRates);

    return newRate;
  }

  /**
   * Fetch cross rate via exchangerate-api.com free endpoint.
   * Strategy: get full table for `from` base then lookup `to`. If that fails,
   * try table for `to` base and invert. Cache base tables in localStorage.
   */
  private static async fetchRate(from: string, to: string): Promise<number> {
    const table = await this.getBaseTable(from);
    const direct = table?.rates?.[to];
    if (typeof direct === 'number' && direct > 0) return direct;

    // Fallback: get table for `to` and invert
    const toTable = await this.getBaseTable(to);
    const back = toTable?.rates?.[from];
    if (typeof back === 'number' && back > 0) return 1 / back;

    // Last resort: 1:1 to avoid hard failures
    return 1.0;
  }

  private static async getBaseTable(base: string): Promise<{ base: string; date?: string; rates: Record<string, number> } | null> {
    const key = this.BASE_CACHE_KEY;
    let cache: Record<string, { data: any; timestamp: string; ttl: number }> = {};
    try {
      const raw = localStorage.getItem(key);
      if (raw) cache = JSON.parse(raw);
    } catch {}

    const entry = cache[base];
    if (entry) {
      const age = Date.now() - new Date(entry.timestamp).getTime();
      if (age < (entry.ttl || this.TTL)) {
        return entry.data;
      }
    }

    try {
      const url = `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(base)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`rate fetch failed: ${res.status}`);
      const json = await res.json();
      const data = { base: json.base || base, date: json.date, rates: json.rates || {} };

      cache[base] = { data, timestamp: new Date().toISOString(), ttl: this.TTL };
      try { localStorage.setItem(key, JSON.stringify(cache)); } catch {}
      return data;
    } catch (e) {
      // Soft failure: return null; caller will fallback
      return null;
    }
  }

  /**
   * Convert amount from one currency to another
   */
  static async convert(
    amount: number,
    from: string,
    to: string
  ): Promise<{ amount: number; rate: number; timestamp: string }> {
    const rateData = await this.getRate(from, to);
    return {
      amount: amount * rateData.rate,
      rate: rateData.rate,
      timestamp: rateData.timestamp,
    };
  }
}
