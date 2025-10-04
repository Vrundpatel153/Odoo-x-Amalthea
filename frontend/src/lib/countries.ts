export interface CountryInfo {
  name: string;
  currencyCodes: string[]; // ISO 4217 codes
  primaryCurrency: string | null;
}

interface CachedCountries {
  data: CountryInfo[];
  timestamp: string; // ISO
  ttl: number; // ms
}

export class CountryCurrencyService {
  private static CACHE_KEY = 'ems_countryCurrencies';
  private static TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  static async getCountries(): Promise<CountryInfo[]> {
    // Try cache
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (raw) {
        const cached: CachedCountries = JSON.parse(raw);
        const age = Date.now() - new Date(cached.timestamp).getTime();
        if (age < cached.ttl && Array.isArray(cached.data) && cached.data.length) {
          return cached.data;
        }
      }
    } catch {}

    // Fetch fresh
    try {
      const url = 'https://restcountries.com/v3.1/all?fields=name,currencies';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch countries: ${res.status}`);
      const json = await res.json();

      const countries: CountryInfo[] = (json || []).map((c: any) => {
        const name: string = c?.name?.common || c?.name?.official || 'Unknown';
        const currencyCodes = Object.keys(c?.currencies || {});
        const primaryCurrency = currencyCodes[0] || null;
        return { name, currencyCodes, primaryCurrency };
      })
        .filter((c: CountryInfo) => !!c.name)
        .sort((a: CountryInfo, b: CountryInfo) => a.name.localeCompare(b.name));

      const payload: CachedCountries = {
        data: countries,
        timestamp: new Date().toISOString(),
        ttl: this.TTL,
      };
      try { localStorage.setItem(this.CACHE_KEY, JSON.stringify(payload)); } catch {}
      return countries;
    } catch (e) {
      // Fallback to a minimal set if network fails
      const fallback: CountryInfo[] = [
        { name: 'United States', currencyCodes: ['USD'], primaryCurrency: 'USD' },
        { name: 'United Kingdom', currencyCodes: ['GBP'], primaryCurrency: 'GBP' },
        { name: 'Eurozone', currencyCodes: ['EUR'], primaryCurrency: 'EUR' },
        { name: 'Japan', currencyCodes: ['JPY'], primaryCurrency: 'JPY' },
        { name: 'Canada', currencyCodes: ['CAD'], primaryCurrency: 'CAD' },
        { name: 'Australia', currencyCodes: ['AUD'], primaryCurrency: 'AUD' },
      ];
      return fallback;
    }
  }

  static async resolveCurrencyForCountry(countryName: string): Promise<string | null> {
    const countries = await this.getCountries();
    const target = countries.find(c => this.normalize(c.name) === this.normalize(countryName));
    return target?.primaryCurrency || null;
  }

  private static normalize(s: string) {
    return (s || '').trim().toLowerCase();
  }
}
