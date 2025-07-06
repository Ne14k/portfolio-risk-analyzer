// Finnhub API service for real-time stock data
// Free tier: 60 API calls/minute

export interface FinnhubQuote {
  c: number; // Current price
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface FinnhubSearchResult {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
}

class FinnhubService {
  private baseUrl = 'https://finnhub.io/api/v1';
  private apiKey: string;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  constructor() {
    // In production, this should come from environment variables
    // For now, we'll use a demo key (replace with actual key)
    this.apiKey = process.env.REACT_APP_FINNHUB_API_KEY || 'demo';
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('token', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const cacheKey = url.toString();
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Finnhub API error:', error);
      throw error;
    }
  }

  // Get real-time quote for a symbol
  async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const [quote, profile] = await Promise.all([
        this.makeRequest<FinnhubQuote>('/quote', { symbol: symbol.toUpperCase() }),
        this.makeRequest<FinnhubCompanyProfile>('/stock/profile2', { symbol: symbol.toUpperCase() })
      ]);

      if (!quote || quote.c === 0) {
        return null; // Invalid symbol or no data
      }

      const change = quote.c - quote.pc;
      const changePercent = (change / quote.pc) * 100;

      return {
        symbol: symbol.toUpperCase(),
        name: profile?.name || symbol.toUpperCase(),
        price: quote.c,
        change: change,
        changePercent: changePercent,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error getting quote for ${symbol}:`, error);
      return null;
    }
  }

  // Search for stock symbols
  async searchSymbol(query: string): Promise<StockSearchResult[]> {
    if (!query || query.length < 1) {
      return [];
    }

    try {
      const result = await this.makeRequest<FinnhubSearchResult>('/search', { q: query.toUpperCase() });
      
      if (!result || !result.result) {
        return [];
      }

      return result.result
        .filter(item => item.type === 'Common Stock' || item.type === 'ETF')
        .slice(0, 10) // Limit to top 10 results
        .map(item => ({
          symbol: item.symbol,
          name: item.description,
          type: item.type,
        }));
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }

  // Get company profile
  async getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile | null> {
    try {
      return await this.makeRequest<FinnhubCompanyProfile>('/stock/profile2', { 
        symbol: symbol.toUpperCase() 
      });
    } catch (error) {
      console.error(`Error getting company profile for ${symbol}:`, error);
      return null;
    }
  }

  // Check if API is properly configured
  isConfigured(): boolean {
    return this.apiKey !== 'demo' && this.apiKey.length > 0;
  }

  // Get API status
  getApiStatus(): { configured: boolean; demo: boolean } {
    return {
      configured: this.isConfigured(),
      demo: this.apiKey === 'demo'
    };
  }
}

// Export singleton instance
export const finnhubService = new FinnhubService();

// Convenience functions for backward compatibility with existing code
export const getStockQuote = (symbol: string): Promise<StockQuote | null> => {
  return finnhubService.getQuote(symbol);
};

export const searchStocks = (query: string): Promise<StockSearchResult[]> => {
  return finnhubService.searchSymbol(query);
};

export default finnhubService;