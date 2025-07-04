// Portfolio TypeScript types for manual input system

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  category: AssetCategory;
  marketValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  lastUpdated: string;
}

export interface Portfolio {
  id: string;
  name: string;
  holdings: Holding[];
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  assetAllocation: AssetAllocation;
  lastUpdated: string;
}

export interface AssetAllocation {
  stocks: number;
  bonds: number;
  realEstate: number;
  cash: number;
  crypto: number;
  commodities: number;
}

export type AssetCategory = 'stocks' | 'bonds' | 'realEstate' | 'cash' | 'crypto' | 'commodities';

export interface PortfolioSummary {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdingsCount: number;
  assetAllocation: AssetAllocation;
  topHoldings: Holding[];
  lastUpdated: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

// Form interfaces for manual input
export interface HoldingFormData {
  ticker: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  category: AssetCategory;
}

export interface AllocationFormData {
  stocks: number;
  bonds: number;
  realEstate: number;
  cash: number;
  crypto: number;
  commodities: number;
}

// Portfolio templates
export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  allocation: AssetAllocation;
  suggestedHoldings: Partial<HoldingFormData>[];
}