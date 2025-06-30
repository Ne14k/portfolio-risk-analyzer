export interface PortfolioAllocation {
  stocks: number;
  bonds: number;
  alternatives: number;
  cash: number;
}

export interface ESGPreferences {
  environmental: number; // 0-1 scale
  social: number;        // 0-1 scale
  governance: number;    // 0-1 scale
  overall_importance: number; // How much ESG matters vs returns
}

export interface TaxPreferences {
  tax_bracket: number; // Tax bracket percentage
  prefer_tax_efficient: boolean;
  account_type: 'taxable' | 'ira' | '401k' | 'roth';
}

export interface SectorPreferences {
  technology?: number;  // Desired allocation (0-1)
  healthcare?: number;
  financials?: number;
  energy?: number;
  max_sector_concentration: number; // Max allocation to any sector
}

export interface PortfolioInput {
  allocation: PortfolioAllocation;
  risk_tolerance: 'low' | 'medium' | 'high';
  target_return?: number;
  time_horizon?: number;
  optimization_goal?: 'sharpe' | 'risk' | 'return' | 'income';
  esg_preferences?: ESGPreferences;
  tax_preferences?: TaxPreferences;
  sector_preferences?: SectorPreferences;
  use_ai_optimization?: boolean;
}

export interface RiskMetrics {
  volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  diversification_score: number;
  expected_return: number;
}

export interface OptimizationResult {
  optimized_allocation: PortfolioAllocation;
  current_metrics: RiskMetrics;
  optimized_metrics: RiskMetrics;
  recommendations: string[];
  explanations: string[];
}

export interface AssetClass {
  name: string;
  display_name: string;
  expected_return: number;
  volatility: number;
  description: string;
}