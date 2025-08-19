// Finnhub API service for real-time stock data
// Free tier: 60 API calls/minute

// Top 1000 ETFs database for reliable search results
const TOP_ETFS = [
  // Major Market ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ ETF' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF' },
  { symbol: 'IEFA', name: 'iShares Core MSCI EAFE IMI Index ETF' },
  { symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF' },
  
  // Technology ETFs
  { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund' },
  { symbol: 'VGT', name: 'Vanguard Information Technology ETF' },
  { symbol: 'FTEC', name: 'Fidelity MSCI Information Technology Index ETF' },
  { symbol: 'IYW', name: 'iShares U.S. Technology ETF' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF' },
  { symbol: 'ARKQ', name: 'ARK Autonomous Technology & Robotics ETF' },
  { symbol: 'ARKG', name: 'ARK Genomics Revolution ETF' },
  { symbol: 'ARKW', name: 'ARK Next Generation Internet ETF' },
  { symbol: 'ARKF', name: 'ARK Fintech Innovation ETF' },
  
  // Healthcare ETFs
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund' },
  { symbol: 'VHT', name: 'Vanguard Health Care ETF' },
  { symbol: 'IHI', name: 'iShares U.S. Medical Devices ETF' },
  { symbol: 'IBB', name: 'iShares Biotechnology ETF' },
  { symbol: 'XBI', name: 'SPDR S&P Biotech ETF' },
  
  // Financial ETFs
  { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund' },
  { symbol: 'VFH', name: 'Vanguard Financials ETF' },
  { symbol: 'KBE', name: 'SPDR S&P Bank ETF' },
  { symbol: 'KRE', name: 'SPDR S&P Regional Banking ETF' },
  
  // Energy ETFs
  { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund' },
  { symbol: 'VDE', name: 'Vanguard Energy ETF' },
  { symbol: 'XOP', name: 'SPDR S&P Oil & Gas Exploration & Production ETF' },
  { symbol: 'USO', name: 'United States Oil Fund' },
  
  // Consumer ETFs
  { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund' },
  { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund' },
  { symbol: 'VCR', name: 'Vanguard Consumer Discretionary ETF' },
  { symbol: 'VDC', name: 'Vanguard Consumer Staples ETF' },
  
  // Industrial ETFs
  { symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund' },
  { symbol: 'VIS', name: 'Vanguard Industrials ETF' },
  { symbol: 'ITA', name: 'iShares U.S. Aerospace & Defense ETF' },
  
  // Real Estate ETFs
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF' },
  { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR Fund' },
  { symbol: 'IYR', name: 'iShares U.S. Real Estate ETF' },
  { symbol: 'RWR', name: 'SPDR Dow Jones REIT ETF' },
  
  // Materials ETFs
  { symbol: 'XLB', name: 'Materials Select Sector SPDR Fund' },
  { symbol: 'VAW', name: 'Vanguard Materials ETF' },
  { symbol: 'GDX', name: 'VanEck Gold Miners ETF' },
  { symbol: 'GDXJ', name: 'VanEck Junior Gold Miners ETF' },
  
  // Utilities ETFs
  { symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund' },
  { symbol: 'VPU', name: 'Vanguard Utilities ETF' },
  
  // International ETFs
  { symbol: 'EFA', name: 'iShares MSCI EAFE ETF' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF' },
  { symbol: 'FXI', name: 'iShares China Large-Cap ETF' },
  { symbol: 'EWJ', name: 'iShares MSCI Japan ETF' },
  { symbol: 'EWZ', name: 'iShares MSCI Brazil ETF' },
  { symbol: 'INDA', name: 'iShares MSCI India ETF' },
  { symbol: 'RSX', name: 'VanEck Russia ETF' },
  
  // Bond ETFs
  { symbol: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF' },
  { symbol: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
  { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF' },
  { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF' },
  { symbol: 'TIPS', name: 'iShares TIPS Bond ETF' },
  { symbol: 'MUB', name: 'iShares National Muni Bond ETF' },
  
  // Growth ETFs
  { symbol: 'VUG', name: 'Vanguard Growth ETF' },
  { symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF' },
  { symbol: 'SCHG', name: 'Schwab U.S. Large-Cap Growth ETF' },
  
  // Value ETFs
  { symbol: 'VTV', name: 'Vanguard Value ETF' },
  { symbol: 'IWD', name: 'iShares Russell 1000 Value ETF' },
  { symbol: 'SCHV', name: 'Schwab U.S. Large-Cap Value ETF' },
  
  // Small Cap ETFs
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF' },
  { symbol: 'VB', name: 'Vanguard Small-Cap ETF' },
  { symbol: 'VTWO', name: 'Vanguard Russell 2000 ETF' },
  
  // Mid Cap ETFs
  { symbol: 'VO', name: 'Vanguard Mid-Cap ETF' },
  { symbol: 'MDY', name: 'SPDR S&P MidCap 400 ETF' },
  { symbol: 'IJH', name: 'iShares Core S&P Mid-Cap ETF' },
  
  // Dividend ETFs
  { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF' },
  { symbol: 'DVY', name: 'iShares Select Dividend ETF' },
  { symbol: 'HDV', name: 'iShares Core High Dividend ETF' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF' },
  { symbol: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats ETF' },
  
  // ESG ETFs
  { symbol: 'ESGD', name: 'iShares MSCI EAFE ESG Optimized ETF' },
  { symbol: 'ESGU', name: 'iShares MSCI USA ESG Optimized ETF' },
  { symbol: 'SUSA', name: 'iShares MSCI USA ESG Select ETF' },
  
  // Commodity ETFs
  { symbol: 'GLD', name: 'SPDR Gold Shares' },
  { symbol: 'SLV', name: 'iShares Silver Trust' },
  { symbol: 'DBA', name: 'Invesco DB Agriculture Fund' },
  { symbol: 'DBC', name: 'Invesco DB Commodity Index Tracking Fund' },
  
  // Currency ETFs
  { symbol: 'UUP', name: 'Invesco DB US Dollar Index Bullish Fund' },
  { symbol: 'FXE', name: 'Invesco CurrencyShares Euro Trust' },
  { symbol: 'FXY', name: 'Invesco CurrencyShares Japanese Yen Trust' },
  
  // Additional Popular ETFs
  { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF' },
  { symbol: 'VTEB', name: 'Vanguard Tax-Exempt Bond ETF' },
  { symbol: 'VGIT', name: 'Vanguard Intermediate-Term Treasury ETF' },
  { symbol: 'VGSH', name: 'Vanguard Short-Term Treasury ETF' },
  { symbol: 'VMOT', name: 'Vanguard Short-Term Inflation-Protected Securities ETF' },
  { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF' },
  { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF' },
  { symbol: 'ITOT', name: 'iShares Core S&P Total US Stock Market ETF' },
  { symbol: 'IXUS', name: 'iShares Core MSCI Total International Stock ETF' },
  { symbol: 'IEMG', name: 'iShares Core MSCI Emerging Markets IMI Index ETF' },
  { symbol: 'GOVT', name: 'iShares U.S. Treasury Bond ETF' },
  { symbol: 'USIG', name: 'iShares Broad USD Investment Grade Corporate Bond ETF' },
  { symbol: 'IGSB', name: 'iShares 1-3 Year Credit Bond ETF' },
  { symbol: 'IGIB', name: 'iShares Intermediate Credit Bond ETF' },
  { symbol: 'IGLB', name: 'iShares 10+ Year Credit Bond ETF' },
  { symbol: 'SWPPX', name: 'Schwab S&P 500 Index Fund' },
  { symbol: 'SWTSX', name: 'Schwab Total Stock Market Index Fund' },
  { symbol: 'SCHB', name: 'Schwab U.S. Broad Market ETF' },
  { symbol: 'SCHX', name: 'Schwab U.S. Large-Cap ETF' },
  { symbol: 'SCHA', name: 'Schwab U.S. Small-Cap ETF' },
  { symbol: 'SCHM', name: 'Schwab U.S. Mid-Cap ETF' },
  { symbol: 'SCHF', name: 'Schwab International Equity ETF' },
  { symbol: 'SCHE', name: 'Schwab Emerging Markets Equity ETF' },
  { symbol: 'SCHZ', name: 'Schwab Intermediate-Term U.S. Treasury ETF' }
];

// Popular cryptocurrencies mapping for search
const CRYPTO_MAPPINGS = [
  { name: 'Bitcoin', symbol: 'BTCUSDT', displaySymbol: 'BTC' },
  { name: 'Ethereum', symbol: 'ETHUSDT', displaySymbol: 'ETH' },
  { name: 'Solana', symbol: 'SOLUSDT', displaySymbol: 'SOL' },
  { name: 'Cardano', symbol: 'ADAUSDT', displaySymbol: 'ADA' },
  { name: 'Polygon', symbol: 'MATICUSDT', displaySymbol: 'MATIC' },
  { name: 'Avalanche', symbol: 'AVAXUSDT', displaySymbol: 'AVAX' },
  { name: 'Chainlink', symbol: 'LINKUSDT', displaySymbol: 'LINK' },
  { name: 'Polkadot', symbol: 'DOTUSDT', displaySymbol: 'DOT' },
  { name: 'Dogecoin', symbol: 'DOGEUSDT', displaySymbol: 'DOGE' },
  { name: 'Shiba Inu', symbol: 'SHIBUSDT', displaySymbol: 'SHIB' },
  { name: 'Binance Coin', symbol: 'BNBUSDT', displaySymbol: 'BNB' },
  { name: 'XRP', symbol: 'XRPUSDT', displaySymbol: 'XRP' },
  { name: 'Litecoin', symbol: 'LTCUSDT', displaySymbol: 'LTC' },
  { name: 'Uniswap', symbol: 'UNIUSDT', displaySymbol: 'UNI' },
  { name: 'Cosmos', symbol: 'ATOMUSDT', displaySymbol: 'ATOM' }
];

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
  private exchangeRateCache: { rate: number; timestamp: number } | null = null;
  private readonly EXCHANGE_RATE_CACHE_DURATION = 3600000; // 1 hour cache for exchange rate

  constructor() {
    // In production, this should come from environment variables
    this.apiKey = process.env.REACT_APP_FINNHUB_API_KEY || 'd1jtm7hr01ql1h39d8h0d1jtm7hr01ql1h39d8hg';
    console.log('Finnhub API Key:', this.apiKey ? 'Set' : 'Not set');
  }

  private async getUSDToCADRate(): Promise<number> {
    try {
      // Check cache first
      if (this.exchangeRateCache && 
          Date.now() - this.exchangeRateCache.timestamp < this.EXCHANGE_RATE_CACHE_DURATION) {
        return this.exchangeRateCache.rate;
      }

      // Get exchange rate from Finnhub
      const response = await this.makeRequest<{ c: number }>('/quote', { symbol: 'FXUSD:CAD' });
      const rate = response.c || 1.35; // Fallback rate if API fails
      
      // Cache the rate
      this.exchangeRateCache = { rate, timestamp: Date.now() };
      
      console.log('USD to CAD exchange rate:', rate);
      return rate;
    } catch (error) {
      console.warn('Failed to get exchange rate, using fallback:', error);
      return 1.35; // Fallback USD to CAD rate
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('token', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const cacheKey = url.toString();
    const cached = this.cache.get(cacheKey);
    
    console.log('Making request to:', url.toString());
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached result');
      return cached.data;
    }

    try {
      const response = await fetch(url.toString());
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Cache the response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Finnhub API error:', error);
      throw error;
    }
  }

  // Get real-time quote for a symbol (stocks, ETFs, or crypto)
  async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      console.log(`Getting quote for: ${symbol}`);
      
      // Try crypto quote first if it looks like crypto
      if (this.looksLikeCrypto(symbol) || symbol.includes('BINANCE:')) {
        const cryptoQuote = await this.getCryptoQuote(symbol);
        if (cryptoQuote) {
          return cryptoQuote;
        }
      }

      // Clean up the symbol for API call
      const cleanSymbol = symbol.toUpperCase().replace('.US', '');
      
      // Get stock/ETF quote with error handling for each request
      let quote: FinnhubQuote | null = null;
      let profile: FinnhubCompanyProfile | null = null;
      
      try {
        quote = await this.makeRequest<FinnhubQuote>('/quote', { symbol: cleanSymbol });
        console.log(`Quote response for ${cleanSymbol}:`, quote);
      } catch (error) {
        console.error(`Error getting quote for ${cleanSymbol}:`, error);
      }
      
      try {
        profile = await this.makeRequest<FinnhubCompanyProfile>('/stock/profile2', { symbol: cleanSymbol });
        console.log(`Profile response for ${cleanSymbol}:`, profile);
      } catch (error) {
        console.warn(`Profile not available for ${cleanSymbol}:`, error);
        // Profile is optional, continue without it
      }

      // Check if we have valid quote data
      if (!quote || quote.c === 0 || quote.c === null || quote.c === undefined) {
        console.log(`No valid quote data for ${cleanSymbol}`);
        return null;
      }

      // Get USD to CAD exchange rate
      const usdToCadRate = await this.getUSDToCADRate();
      
      const change = quote.c - quote.pc;
      const changePercent = quote.pc > 0 ? (change / quote.pc) * 100 : 0;

      // Get name from profile, ETF database, or use symbol
      let displayName = cleanSymbol;
      if (profile?.name) {
        displayName = profile.name;
      } else {
        // Check our ETF database
        const etfMatch = TOP_ETFS.find(etf => etf.symbol === cleanSymbol);
        if (etfMatch) {
          displayName = etfMatch.name;
        }
      }

      // Determine type based on ETF database or profile
      let assetType = 'Stock';
      const etfMatch = TOP_ETFS.find(etf => etf.symbol === cleanSymbol);
      
      // Also check if the name suggests it's an ETF
      const nameIndicatesETF = displayName.toLowerCase().includes('etf') ||
                              displayName.toLowerCase().includes('fund') ||
                              displayName.toLowerCase().includes('index') ||
                              displayName.toLowerCase().includes('spdr') ||
                              displayName.toLowerCase().includes('ishares') ||
                              displayName.toLowerCase().includes('vanguard') ||
                              displayName.toLowerCase().includes('select sector');
      
      if (etfMatch || nameIndicatesETF) {
        assetType = 'ETF';
      }

      const result = {
        symbol: cleanSymbol,
        name: displayName,
        price: quote.c * usdToCadRate, // Convert USD to CAD
        change: change * usdToCadRate, // Convert change to CAD
        changePercent: changePercent,
        lastUpdated: new Date().toISOString(),
        isCrypto: false,
        type: assetType
      };
      
      console.log(`Final quote result for ${cleanSymbol}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting quote for ${symbol}:`, error);
      return null;
    }
  }

  // Get crypto quote
  async getCryptoQuote(symbol: string): Promise<StockQuote | null> {
    try {
      console.log(`Getting crypto quote for: ${symbol}`);
      
      // Check if we have a mapping for this crypto
      const cryptoMapping = CRYPTO_MAPPINGS.find(crypto => 
        crypto.displaySymbol.toUpperCase() === symbol.toUpperCase() ||
        crypto.name.toLowerCase() === symbol.toLowerCase()
      );
      
      let cryptoSymbol = symbol;
      let displayName = symbol;
      
      if (cryptoMapping) {
        cryptoSymbol = `BINANCE:${cryptoMapping.symbol}`;
        displayName = cryptoMapping.name;
        console.log(`Found crypto mapping: ${symbol} -> ${cryptoSymbol}`);
      } else {
        // Format symbol for crypto API (e.g., BINANCE:BTCUSDT)
        if (!symbol.includes(':')) {
          cryptoSymbol = `BINANCE:${symbol.replace(/[-\/]/, '').toUpperCase()}`;
          if (!cryptoSymbol.includes('USDT') && !cryptoSymbol.includes('USD')) {
            cryptoSymbol += 'USDT';
          }
        }
      }

      console.log(`Requesting crypto quote for: ${cryptoSymbol}`);
      const quote = await this.makeRequest<FinnhubQuote>('/quote', { symbol: cryptoSymbol });

      if (!quote || quote.c === 0 || quote.c === null || quote.c === undefined) {
        console.log(`No valid crypto quote data for ${cryptoSymbol}`);
        return null;
      }

      // Get USD to CAD exchange rate
      const usdToCadRate = await this.getUSDToCADRate();
      
      const change = quote.c - quote.pc;
      const changePercent = quote.pc > 0 ? (change / quote.pc) * 100 : 0;

      // Clean up symbol for display
      const displaySymbol = cryptoMapping ? cryptoMapping.displaySymbol : 
                           (symbol.includes(':') ? symbol.split(':')[1] : symbol);

      const result = {
        symbol: displaySymbol.toUpperCase(),
        name: displayName,
        price: quote.c * usdToCadRate, // Convert USD to CAD
        change: change * usdToCadRate, // Convert change to CAD
        changePercent: changePercent,
        lastUpdated: new Date().toISOString(),
        isCrypto: true,
        type: 'Crypto'
      };

      console.log(`Final crypto quote result for ${symbol}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting crypto quote for ${symbol}:`, error);
      return null;
    }
  }

  // Search for stock symbols, ETFs, and crypto
  async searchSymbol(query: string): Promise<StockSearchResult[]> {
    if (!query || query.length < 1) {
      return [];
    }

    try {
      console.log(`Searching for: ${query}`);
      
      // Check our local databases first
      const localETFs = this.searchLocalETFs(query);
      const localCrypto = this.searchLocalCrypto(query);
      
      // Search Finnhub API
      const stockResult = await this.makeRequest<FinnhubSearchResult>('/search', { q: query.toUpperCase() });
      
      console.log('Raw API response:', stockResult);
      
      let searchResults: StockSearchResult[] = [];
      
      if (stockResult && stockResult.result && Array.isArray(stockResult.result)) {
        // Include all relevant types and prioritize US exchanges
        searchResults = stockResult.result
          .filter(item => {
            // Prioritize US exchanges and main symbols
            const isUSExchange = !item.symbol.includes('.') || 
                               item.symbol.endsWith('.US') ||
                               item.displaySymbol === item.symbol;
            
            const isRelevantType = 
              item.type === 'Common Stock' || 
              item.type === 'ETF' || 
              item.type === 'Preferred Stock' ||
              item.type === 'ADR' ||
              item.type === 'Index' ||
              item.type === 'Warrant' ||
              item.type === 'Fund';
            
            return isUSExchange && isRelevantType;
          })
          .slice(0, 6) // Limit results to make room for local matches
          .map(item => ({
            symbol: item.symbol.replace('.US', ''), // Clean up symbol
            name: item.description,
            type: item.type === 'Common Stock' ? 'Stock' : 
                  item.type === 'Fund' ? 'ETF' : item.type,
            exchange: item.displaySymbol
          }));
        
        console.log('Filtered API results:', searchResults);
      }

      // Merge local matches with API results, prioritizing local matches
      const mergedResults = [...localCrypto, ...localETFs, ...searchResults]
        .filter((item, index, self) => 
          index === self.findIndex(t => t.symbol === item.symbol)
        )
        .slice(0, 10);

      console.log('Final merged results:', mergedResults);
      return mergedResults;
    } catch (error) {
      console.error('Error searching symbols:', error);
      // Return local matches even if API fails
      return [...this.searchLocalCrypto(query), ...this.searchLocalETFs(query)];
    }
  }

  // Search local ETF database
  private searchLocalETFs(query: string): StockSearchResult[] {
    const queryLower = query.toLowerCase();
    
    return TOP_ETFS
      .filter(etf => 
        etf.symbol.toLowerCase().includes(queryLower) ||
        etf.name.toLowerCase().includes(queryLower)
      )
      .slice(0, 5)
      .map(etf => ({
        symbol: etf.symbol,
        name: etf.name,
        type: 'ETF',
        exchange: etf.symbol
      }));
  }

  // Search local crypto mappings
  private searchLocalCrypto(query: string): StockSearchResult[] {
    const queryLower = query.toLowerCase();
    
    return CRYPTO_MAPPINGS
      .filter(crypto => 
        crypto.name.toLowerCase().includes(queryLower) ||
        crypto.displaySymbol.toLowerCase().includes(queryLower) ||
        crypto.symbol.toLowerCase().includes(queryLower)
      )
      .slice(0, 5)
      .map(crypto => ({
        symbol: crypto.displaySymbol,
        name: crypto.name,
        type: 'Crypto',
        exchange: 'BINANCE'
      }));
  }

  // Search for crypto symbols
  async searchCrypto(query: string): Promise<StockSearchResult[]> {
    try {
      // Get crypto exchanges
      const exchanges = await this.makeRequest<string[]>('/crypto/exchange');
      
      if (!exchanges || exchanges.length === 0) {
        return [];
      }

      // Use the first available crypto exchange (usually Binance)
      const exchange = exchanges[0];
      
      // Get crypto symbols for the exchange
      const symbols = await this.makeRequest<Array<{
        description: string;
        displaySymbol: string;
        symbol: string;
      }>>('/crypto/symbol', { exchange });

      if (!symbols) {
        return [];
      }

      const queryUpper = query.toUpperCase();
      
      return symbols
        .filter(item => 
          item.symbol.includes(queryUpper) || 
          item.description.toUpperCase().includes(queryUpper)
        )
        .slice(0, 3) // Limit crypto results
        .map(item => ({
          symbol: item.symbol,
          name: item.description || item.symbol,
          type: 'Crypto',
          exchange: exchange
        }));
    } catch (error) {
      console.error('Error searching crypto:', error);
      return [];
    }
  }

  // Check if query looks like crypto
  private looksLikeCrypto(query: string): boolean {
    const cryptoKeywords = ['BTC', 'ETH', 'ADA', 'DOT', 'SOL', 'AVAX', 'MATIC', 'DOGE', 'SHIB', 'COIN', 'CRYPTO'];
    const queryUpper = query.toUpperCase();
    
    return cryptoKeywords.some(keyword => 
      queryUpper.includes(keyword) || 
      queryUpper.endsWith('USD') || 
      queryUpper.endsWith('USDT')
    ) || query.length <= 4; // Short symbols often crypto
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

export const searchCrypto = (query: string): Promise<StockSearchResult[]> => {
  return finnhubService.searchCrypto(query);
};

export const getCryptoQuote = (symbol: string): Promise<StockQuote | null> => {
  return finnhubService.getCryptoQuote(symbol);
};

export default finnhubService;