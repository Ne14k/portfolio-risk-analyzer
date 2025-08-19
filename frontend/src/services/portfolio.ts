import { Portfolio, Holding, PortfolioSummary, HoldingFormData, StockQuote, PortfolioTemplate } from '../types/portfolio';
import { getStockQuote as finnhubGetStockQuote } from './finnhub';
import { SupabasePortfolioService } from './supabasePortfolio';

// Local storage keys
const PORTFOLIO_STORAGE_KEY = 'myportfolio_data';
const LAST_UPDATED_KEY = 'myportfolio_last_updated';

/**
 * Portfolio management service using localStorage
 */
export class PortfolioService {
  
  /**
   * Save portfolio data to localStorage
   */
  static savePortfolio(portfolio: Portfolio): void {
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio));
      localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving portfolio:', error);
      throw new Error('Failed to save portfolio data');
    }
  }

  /**
   * Load portfolio data (prioritize Supabase, fallback to localStorage)
   */
  static async loadPortfolio(): Promise<Portfolio | null> {
    try {
      // Try Supabase first
      const portfolio = await SupabasePortfolioService.getUserPortfolio();
      if (portfolio) return portfolio;
      
      // Fallback to localStorage
      const data = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (!data) return null;
      
      return JSON.parse(data) as Portfolio;
    } catch (error) {
      console.error('Error loading portfolio:', error);
      // Final fallback to localStorage
      try {
        const data = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        return data ? JSON.parse(data) as Portfolio : null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Create a new empty portfolio
   */
  static createEmptyPortfolio(): Portfolio {
    return {
      id: 'default',
      name: 'My Portfolio',
      holdings: [],
      totalValue: 0,
      totalGainLoss: 0,
      totalGainLossPercentage: 0,
      assetAllocation: {
        stocks: 0,
        etfs: 0,
        crypto: 0,
        bonds: 0,
        realEstate: 0,
        cash: 0,
        commodities: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Add a new holding to the portfolio
   */
  static async addHolding(holdingData: HoldingFormData): Promise<Holding | null> {
    try {
      console.log('🔄 PortfolioService.addHolding called with:', holdingData);
      
      // Try Supabase first
      console.log('📡 Attempting Supabase insert...');
      const holding = await SupabasePortfolioService.addHolding(holdingData);
      if (holding) {
        console.log('✅ Supabase insert successful, returning holding:', holding);
        return holding;
      }

      console.log('⚠️ Supabase insert failed, falling back to localStorage...');

      // Fallback to localStorage
      // Map ETF category for localStorage compatibility
      let storageCategory = holdingData.category;
      if (holdingData.category === 'etfs') {
        // Keep ETF category for localStorage since it supports all categories
        storageCategory = 'etfs';
      }
      
      const portfolio = await this.loadPortfolio() || this.createEmptyPortfolio();
      
      // Check for existing holding with same ticker and category
      // For localStorage, category mapping is consistent so we can check directly
      const existingHoldingIndex = portfolio.holdings.findIndex(h => 
        h.ticker.toUpperCase() === holdingData.ticker.toUpperCase() && 
        h.category === storageCategory
      );
      
      if (existingHoldingIndex !== -1) {
        // Update existing holding by adding quantities and recalculating weighted average price
        const existingHolding = portfolio.holdings[existingHoldingIndex];
        const totalQuantity = existingHolding.quantity + holdingData.quantity;
        
        console.log('🔄 CONSOLIDATING DUPLICATE HOLDING:', {
          ticker: holdingData.ticker,
          category: storageCategory,
          existingQuantity: existingHolding.quantity,
          addingQuantity: holdingData.quantity,
          newTotalQuantity: totalQuantity,
          oldPrice: existingHolding.currentPrice,
          newPrice: holdingData.currentPrice
        });
        
        // Update the existing holding
        existingHolding.quantity = totalQuantity;
        existingHolding.currentPrice = holdingData.currentPrice; // Use latest price
        existingHolding.marketValue = totalQuantity * holdingData.currentPrice;
        existingHolding.lastUpdated = new Date().toISOString();
        
        // Update name if it's different (in case of more detailed name)
        if (holdingData.name && holdingData.name !== existingHolding.name) {
          existingHolding.name = holdingData.name;
        }
        
        console.log('✅ SUCCESSFULLY CONSOLIDATED HOLDING:', existingHolding);
        
        this.updatePortfolioCalculations(portfolio);
        this.savePortfolio(portfolio);
        
        return existingHolding;
      } else {
        // Create new holding
        const newHolding: Holding = {
          id: `holding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ticker: holdingData.ticker.toUpperCase(),
          name: holdingData.name,
          quantity: holdingData.quantity,
          purchasePrice: 0, // No longer used but kept for compatibility
          currentPrice: holdingData.currentPrice,
          category: storageCategory,
          marketValue: holdingData.quantity * holdingData.currentPrice,
          gainLoss: 0, // No longer calculated
          gainLossPercentage: 0, // No longer calculated
          lastUpdated: new Date().toISOString(),
        };

        portfolio.holdings.push(newHolding);
        this.updatePortfolioCalculations(portfolio);
        this.savePortfolio(portfolio);

        console.log('✅ localStorage fallback successful, returning holding:', newHolding);
        return newHolding;
      }
    } catch (error) {
      console.error('❌ Error in PortfolioService.addHolding:', error);
      return null;
    }
  }

  /**
   * Update an existing holding
   */
  static async updateHolding(holdingId: string, updates: Partial<HoldingFormData>): Promise<boolean> {
    try {
      // Try Supabase first
      const success = await SupabasePortfolioService.updateHolding(holdingId, updates);
      if (success) return true;

      // Fallback to localStorage
      const portfolio = await this.loadPortfolio();
      if (!portfolio) throw new Error('Portfolio not found');

      const holdingIndex = portfolio.holdings.findIndex(h => h.id === holdingId);
      if (holdingIndex === -1) throw new Error('Holding not found');

      const holding = portfolio.holdings[holdingIndex];
      
      // Update fields
      if (updates.ticker) holding.ticker = updates.ticker.toUpperCase();
      if (updates.name) holding.name = updates.name;
      if (updates.quantity !== undefined) holding.quantity = updates.quantity;
      if (updates.currentPrice !== undefined) holding.currentPrice = updates.currentPrice;
      if (updates.category) holding.category = updates.category;

      // Recalculate derived values
      holding.marketValue = holding.quantity * holding.currentPrice;
      holding.gainLoss = 0; // No longer calculated
      holding.gainLossPercentage = 0; // No longer calculated
      holding.lastUpdated = new Date().toISOString();

      this.updatePortfolioCalculations(portfolio);
      this.savePortfolio(portfolio);
      return true;
    } catch (error) {
      console.error('Error updating holding:', error);
      return false;
    }
  }

  /**
   * Remove a holding from the portfolio
   */
  static async removeHolding(holdingId: string): Promise<boolean> {
    try {
      // Try Supabase first
      const success = await SupabasePortfolioService.removeHolding(holdingId);
      if (success) return true;

      // Fallback to localStorage
      const portfolio = await this.loadPortfolio();
      if (!portfolio) throw new Error('Portfolio not found');

      portfolio.holdings = portfolio.holdings.filter(h => h.id !== holdingId);
      this.updatePortfolioCalculations(portfolio);
      this.savePortfolio(portfolio);
      return true;
    } catch (error) {
      console.error('Error removing holding:', error);
      return false;
    }
  }

  /**
   * Update portfolio-level calculations
   */
  static updatePortfolioCalculations(portfolio: Portfolio): void {
    portfolio.totalValue = portfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0);
    portfolio.totalGainLoss = 0; // No longer calculated
    portfolio.totalGainLossPercentage = 0; // No longer calculated

    // Calculate asset allocation based on current holdings
    if (portfolio.totalValue > 0) {
      const allocations = portfolio.holdings.reduce((acc, holding) => {
        const percentage = (holding.marketValue / portfolio.totalValue) * 100;
        acc[holding.category] += percentage;
        return acc;
      }, {
        stocks: 0,
        etfs: 0,
        crypto: 0,
        bonds: 0,
        realEstate: 0,
        cash: 0,
        commodities: 0,
      });
      
      portfolio.assetAllocation = allocations;
    }

    portfolio.lastUpdated = new Date().toISOString();
  }

  /**
   * Auto-update all holding prices from API
   */
  static async updateAllHoldingPrices(): Promise<void> {
    try {
      // Try Supabase first
      await SupabasePortfolioService.updateAllHoldingPrices();
      console.log('Supabase price update completed');
    } catch (error) {
      console.log('Supabase update failed, falling back to localStorage');
      
      // Fallback to localStorage
      const portfolio = await this.loadPortfolio();
      if (!portfolio || portfolio.holdings.length === 0) return;

      console.log('Auto-updating holding prices...');
      
      for (const holding of portfolio.holdings) {
        try {
          const quote = await getStockQuote(holding.ticker);
          if (quote && quote.price > 0) {
            holding.currentPrice = quote.price;
            holding.marketValue = holding.quantity * holding.currentPrice;
            holding.lastUpdated = new Date().toISOString();
            console.log(`Updated ${holding.ticker}: $${quote.price}`);
          }
        } catch (error) {
          console.warn(`Failed to update price for ${holding.ticker}:`, error);
        }
        
        // Add small delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      this.updatePortfolioCalculations(portfolio);
      this.savePortfolio(portfolio);
      console.log('Auto-update complete');
    }
  }

  /**
   * Start automatic price updates every 60 minutes
   */
  static startAutoUpdates(): void {
    // Update immediately on start
    this.updateAllHoldingPrices();
    
    // Set up interval for every 60 minutes (3600000 ms)
    const updateInterval = setInterval(() => {
      this.updateAllHoldingPrices();
    }, 60 * 60 * 1000);

    // Store interval ID for potential cleanup
    (window as any).portfolioUpdateInterval = updateInterval;
    
    console.log('Auto-update started: prices will refresh every 60 minutes');
  }

  /**
   * Stop automatic price updates
   */
  static stopAutoUpdates(): void {
    const interval = (window as any).portfolioUpdateInterval;
    if (interval) {
      clearInterval(interval);
      (window as any).portfolioUpdateInterval = null;
      console.log('Auto-update stopped');
    }
  }

  /**
   * Get portfolio summary
   */
  static async getPortfolioSummary(): Promise<PortfolioSummary | null> {
    try {
      // Try Supabase first
      const summary = await SupabasePortfolioService.getPortfolioSummary();
      if (summary) return summary;

      // Fallback to localStorage
      const portfolio = await this.loadPortfolio() || this.createEmptyPortfolio();
      
      return {
        totalValue: portfolio.totalValue,
        totalGainLoss: portfolio.totalGainLoss,
        totalGainLossPercentage: portfolio.totalGainLossPercentage,
        holdingsCount: portfolio.holdings.length,
        assetAllocation: portfolio.assetAllocation,
        topHoldings: portfolio.holdings
          .sort((a, b) => b.marketValue - a.marketValue)
          .slice(0, 5),
        lastUpdated: portfolio.lastUpdated,
      };
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      return null;
    }
  }

  /**
   * Clear all portfolio data
   */
  static async clearPortfolio(): Promise<boolean> {
    try {
      // Try Supabase first
      const success = await SupabasePortfolioService.clearPortfolio();
      if (success) {
        // Also clear localStorage
        localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
        localStorage.removeItem(LAST_UPDATED_KEY);
        return true;
      }

      // Fallback to localStorage only
      localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
      localStorage.removeItem(LAST_UPDATED_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing portfolio:', error);
      return false;
    }
  }
}

/**
 * Stock price service using Finnhub API
 */
export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  try {
    // Try to get real data from Finnhub first
    const quote = await finnhubGetStockQuote(symbol);
    if (quote) {
      return quote;
    }
  } catch (error) {
    console.warn('Finnhub API unavailable, falling back to mock data');
  }
  
  // Fallback to mock data if Finnhub fails (for demo purposes)
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  // Mock prices in CAD (converted from USD using approximate 1.35 rate)
  const mockPrices: Record<string, StockQuote> = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 236.93, change: 3.38, changePercent: 1.45, lastUpdated: new Date().toISOString(), isCrypto: false, type: 'Stock' },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 3712.91, change: -20.52, changePercent: -0.55, lastUpdated: new Date().toISOString(), isCrypto: false, type: 'Stock' },
    'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 561.33, change: 7.56, changePercent: 1.36, lastUpdated: new Date().toISOString(), isCrypto: false, type: 'Stock' },
    'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 4563.00, change: 61.02, changePercent: 1.36, lastUpdated: new Date().toISOString(), isCrypto: false, type: 'Stock' },
    'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 1202.18, change: -16.61, changePercent: -1.36, lastUpdated: new Date().toISOString(), isCrypto: false, type: 'Stock' },
    'VTI': { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 324.34, change: 2.50, changePercent: 0.78, lastUpdated: new Date().toISOString(), isCrypto: false, type: 'ETF' },
    'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 642.06, change: 4.32, changePercent: 0.68, lastUpdated: new Date().toISOString(), isCrypto: false, type: 'ETF' },
    'VOO': { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 540.25, change: 3.75, changePercent: 0.70, lastUpdated: new Date().toISOString(), isCrypto: false, type: 'ETF' },
    'BTC': { symbol: 'BTC', name: 'Bitcoin', price: 94500.00, change: 1350.00, changePercent: 1.45, lastUpdated: new Date().toISOString(), isCrypto: true, type: 'Crypto' },
    'ETH': { symbol: 'ETH', name: 'Ethereum', price: 4050.00, change: -120.50, changePercent: -2.89, lastUpdated: new Date().toISOString(), isCrypto: true, type: 'Crypto' },
  };

  return mockPrices[symbol.toUpperCase()] || null;
};

/**
 * Portfolio templates for quick setup
 */
export const getPortfolioTemplates = (): PortfolioTemplate[] => {
  return [
    {
      id: 'conservative',
      name: 'Conservative Portfolio',
      description: 'Low risk with focus on bonds and stable investments',
      riskLevel: 'conservative',
      allocation: { stocks: 30, etfs: 0, crypto: 0, bonds: 50, realEstate: 10, cash: 10, commodities: 0 },
      suggestedHoldings: [
        { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'stocks' },
        { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', category: 'bonds' },
      ],
    },
    {
      id: 'moderate',
      name: 'Moderate Portfolio',
      description: 'Balanced mix of stocks and bonds for steady growth',
      riskLevel: 'moderate',
      allocation: { stocks: 60, etfs: 0, crypto: 0, bonds: 30, realEstate: 5, cash: 5, commodities: 0 },
      suggestedHoldings: [
        { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'stocks' },
        { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', category: 'bonds' },
        { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', category: 'realEstate' },
      ],
    },
    {
      id: 'aggressive',
      name: 'Aggressive Portfolio',
      description: 'High growth potential with mostly stocks and some alternatives',
      riskLevel: 'aggressive',
      allocation: { stocks: 80, etfs: 0, crypto: 3, bonds: 10, realEstate: 5, cash: 0, commodities: 2 },
      suggestedHoldings: [
        { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'stocks' },
        { ticker: 'VXUS', name: 'Vanguard Total International Stock ETF', category: 'stocks' },
        { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', category: 'realEstate' },
      ],
    },
  ];
};

/**
 * Utility functions
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const getGainLossColor = (value: number): string => {
  if (value > 0) return 'text-green-600 dark:text-green-400';
  if (value < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
};