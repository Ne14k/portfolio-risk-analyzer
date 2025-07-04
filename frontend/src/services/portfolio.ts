import { Portfolio, Holding, PortfolioSummary, AssetAllocation, HoldingFormData, StockQuote, PortfolioTemplate } from '../types/portfolio';

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
   * Load portfolio data from localStorage
   */
  static loadPortfolio(): Portfolio | null {
    try {
      const data = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (!data) return null;
      
      const portfolio = JSON.parse(data) as Portfolio;
      return portfolio;
    } catch (error) {
      console.error('Error loading portfolio:', error);
      return null;
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
        bonds: 0,
        realEstate: 0,
        cash: 0,
        crypto: 0,
        commodities: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Add a new holding to the portfolio
   */
  static addHolding(holdingData: HoldingFormData): Holding {
    const holding: Holding = {
      id: `holding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticker: holdingData.ticker.toUpperCase(),
      name: holdingData.name,
      quantity: holdingData.quantity,
      purchasePrice: holdingData.purchasePrice,
      currentPrice: holdingData.currentPrice,
      category: holdingData.category,
      marketValue: holdingData.quantity * holdingData.currentPrice,
      gainLoss: (holdingData.currentPrice - holdingData.purchasePrice) * holdingData.quantity,
      gainLossPercentage: ((holdingData.currentPrice - holdingData.purchasePrice) / holdingData.purchasePrice) * 100,
      lastUpdated: new Date().toISOString(),
    };

    const portfolio = this.loadPortfolio() || this.createEmptyPortfolio();
    portfolio.holdings.push(holding);
    this.updatePortfolioCalculations(portfolio);
    this.savePortfolio(portfolio);

    return holding;
  }

  /**
   * Update an existing holding
   */
  static updateHolding(holdingId: string, updates: Partial<HoldingFormData>): void {
    const portfolio = this.loadPortfolio();
    if (!portfolio) throw new Error('Portfolio not found');

    const holdingIndex = portfolio.holdings.findIndex(h => h.id === holdingId);
    if (holdingIndex === -1) throw new Error('Holding not found');

    const holding = portfolio.holdings[holdingIndex];
    
    // Update fields
    if (updates.ticker) holding.ticker = updates.ticker.toUpperCase();
    if (updates.name) holding.name = updates.name;
    if (updates.quantity !== undefined) holding.quantity = updates.quantity;
    if (updates.purchasePrice !== undefined) holding.purchasePrice = updates.purchasePrice;
    if (updates.currentPrice !== undefined) holding.currentPrice = updates.currentPrice;
    if (updates.category) holding.category = updates.category;

    // Recalculate derived values
    holding.marketValue = holding.quantity * holding.currentPrice;
    holding.gainLoss = (holding.currentPrice - holding.purchasePrice) * holding.quantity;
    holding.gainLossPercentage = ((holding.currentPrice - holding.purchasePrice) / holding.purchasePrice) * 100;
    holding.lastUpdated = new Date().toISOString();

    this.updatePortfolioCalculations(portfolio);
    this.savePortfolio(portfolio);
  }

  /**
   * Remove a holding from the portfolio
   */
  static removeHolding(holdingId: string): void {
    const portfolio = this.loadPortfolio();
    if (!portfolio) throw new Error('Portfolio not found');

    portfolio.holdings = portfolio.holdings.filter(h => h.id !== holdingId);
    this.updatePortfolioCalculations(portfolio);
    this.savePortfolio(portfolio);
  }

  /**
   * Update portfolio-level calculations
   */
  static updatePortfolioCalculations(portfolio: Portfolio): void {
    portfolio.totalValue = portfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0);
    portfolio.totalGainLoss = portfolio.holdings.reduce((sum, h) => sum + h.gainLoss, 0);
    
    const totalCost = portfolio.holdings.reduce((sum, h) => sum + (h.purchasePrice * h.quantity), 0);
    portfolio.totalGainLossPercentage = totalCost > 0 ? (portfolio.totalGainLoss / totalCost) * 100 : 0;

    // Calculate asset allocation based on current holdings
    if (portfolio.totalValue > 0) {
      const allocations = portfolio.holdings.reduce((acc, holding) => {
        const percentage = (holding.marketValue / portfolio.totalValue) * 100;
        acc[holding.category] += percentage;
        return acc;
      }, {
        stocks: 0,
        bonds: 0,
        realEstate: 0,
        cash: 0,
        crypto: 0,
        commodities: 0,
      });
      
      portfolio.assetAllocation = allocations;
    }

    portfolio.lastUpdated = new Date().toISOString();
  }

  /**
   * Get portfolio summary
   */
  static getPortfolioSummary(): PortfolioSummary {
    const portfolio = this.loadPortfolio() || this.createEmptyPortfolio();
    
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
  }

  /**
   * Clear all portfolio data
   */
  static clearPortfolio(): void {
    localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    localStorage.removeItem(LAST_UPDATED_KEY);
  }
}

/**
 * Mock stock price service (replace with real API in production)
 */
export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  // Mock implementation - replace with real API like Alpha Vantage, IEX Cloud, etc.
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  const mockPrices: Record<string, StockQuote> = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.50, changePercent: 1.45, lastUpdated: new Date().toISOString() },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.30, change: -15.20, changePercent: -0.55, lastUpdated: new Date().toISOString() },
    'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.80, change: 5.60, changePercent: 1.36, lastUpdated: new Date().toISOString() },
    'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3380.00, change: 45.20, changePercent: 1.36, lastUpdated: new Date().toISOString() },
    'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 890.50, change: -12.30, changePercent: -1.36, lastUpdated: new Date().toISOString() },
    'VTI': { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 240.25, change: 1.85, changePercent: 0.78, lastUpdated: new Date().toISOString() },
    'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 475.60, change: 3.20, changePercent: 0.68, lastUpdated: new Date().toISOString() },
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
      allocation: { stocks: 30, bonds: 50, realEstate: 10, cash: 10, crypto: 0, commodities: 0 },
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
      allocation: { stocks: 60, bonds: 30, realEstate: 5, cash: 5, crypto: 0, commodities: 0 },
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
      allocation: { stocks: 80, bonds: 10, realEstate: 5, cash: 0, crypto: 3, commodities: 2 },
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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