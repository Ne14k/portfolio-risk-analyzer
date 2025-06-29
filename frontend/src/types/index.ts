export interface PortfolioAllocation {
  stocks: number;
  bonds: number;
  alternatives: number;
  cash: number;
}

export interface PortfolioInput {
  allocation: PortfolioAllocation;
  risk_tolerance: 'low' | 'medium' | 'high';
  target_return?: number;
  time_horizon?: number;
  optimization_goal?: 'sharpe' | 'risk' | 'return' | 'income';
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