import { ExchangeRate } from './types';
import { storage } from './storage';

/**
 * Mock exchange rate service
 * In production, this would call a real API like exchangerate-api.com
 */
export class ExchangeRateService {
  private static TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  /**
   * Mock exchange rates (base: USD)
   */
  private static mockRates: Record<string, number> = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 149.50,
    'CAD': 1.36,
    'AUD': 1.52,
    'CHF': 0.88,
    'CNY': 7.24,
    'INR': 83.12,
  };

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

    // Fetch new rate (mock)
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
   * Mock API call to fetch exchange rate
   */
  private static async fetchRate(from: string, to: string): Promise<number> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const fromRate = this.mockRates[from] || 1.0;
    const toRate = this.mockRates[to] || 1.0;

    // Calculate cross rate
    return toRate / fromRate;
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
