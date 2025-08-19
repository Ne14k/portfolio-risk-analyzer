"""Portfolio data models for the ML service"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Literal, Union
from datetime import datetime
import numpy as np

class PortfolioAllocation(BaseModel):
    stocks: float = Field(ge=0, le=1, description="Allocation to stocks (0-1)")
    bonds: float = Field(ge=0, le=1, description="Allocation to bonds (0-1)")
    alternatives: float = Field(ge=0, le=1, description="Allocation to alternatives (0-1)")
    cash: float = Field(ge=0, le=1, description="Allocation to cash (0-1)")
    
    @validator('stocks', 'bonds', 'alternatives', 'cash')
    def validate_allocation(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('Allocation must be between 0 and 1')
        return v
    
    @validator('cash')
    def validate_total_allocation(cls, v, values):
        total = v + values.get('stocks', 0) + values.get('bonds', 0) + values.get('alternatives', 0)
        if abs(total - 1.0) > 0.01:  # Allow small floating point errors
            raise ValueError(f'Total allocation must sum to 1.0, got {total}')
        return v
    
    def to_numpy(self) -> np.ndarray:
        return np.array([self.stocks, self.bonds, self.alternatives, self.cash])
    
    @classmethod
    def from_numpy(cls, arr: np.ndarray) -> 'PortfolioAllocation':
        return cls(
            stocks=float(arr[0]),
            bonds=float(arr[1]),
            alternatives=float(arr[2]),
            cash=float(arr[3])
        )

class ESGPreferences(BaseModel):
    environmental: float = Field(0.5, ge=0, le=1, description="Environmental factor importance (0-1)")
    social: float = Field(0.5, ge=0, le=1, description="Social factor importance (0-1)")
    governance: float = Field(0.5, ge=0, le=1, description="Governance factor importance (0-1)")
    overall_importance: float = Field(0.5, ge=0, le=1, description="Overall ESG importance vs returns (0-1)")
    
    def get_composite_score(self) -> float:
        return (self.environmental + self.social + self.governance) / 3.0

class TaxPreferences(BaseModel):
    tax_bracket: float = Field(0.25, ge=0, le=0.5, description="Tax bracket percentage (0-0.5)")
    prefer_tax_efficient: bool = Field(True, description="Whether to prefer tax-efficient investments")
    account_type: Literal["taxable", "ira", "401k", "roth"] = Field("taxable", description="Account type for tax optimization")
    
    def get_tax_efficiency_multiplier(self) -> float:
        if self.account_type in ["ira", "401k", "roth"]:
            return 1.0
        
        if self.prefer_tax_efficient:
            return 1.0 - (self.tax_bracket * 0.5)
        else:
            return 1.0 - self.tax_bracket

class SectorPreferences(BaseModel):
    technology: Optional[float] = Field(None, ge=0, le=1, description="Desired technology allocation (0-1)")
    healthcare: Optional[float] = Field(None, ge=0, le=1, description="Desired healthcare allocation (0-1)")
    financials: Optional[float] = Field(None, ge=0, le=1, description="Desired financials allocation (0-1)")
    energy: Optional[float] = Field(None, ge=0, le=1, description="Desired energy allocation (0-1)")
    max_sector_concentration: float = Field(0.3, ge=0, le=1, description="Maximum allocation to any single sector (0-1)")
    
    def get_sector_constraints(self) -> Dict[str, float]:
        constraints = {}
        for sector in ['technology', 'healthcare', 'financials', 'energy']:
            value = getattr(self, sector)
            if value is not None:
                constraints[sector] = value
        return constraints

class PortfolioInput(BaseModel):
    """
    Complete portfolio optimization input
    
    Contains all information needed to perform portfolio optimization including
    current allocation, risk preferences, and optimization constraints.
    """
    allocation: PortfolioAllocation
    risk_tolerance: Literal["low", "medium", "high"] = Field(description="Risk tolerance level")
    target_return: Optional[float] = Field(None, ge=0, le=1, description="Target annual return (0-1)")
    time_horizon: Optional[int] = Field(None, ge=1, le=50, description="Investment time horizon in years")
    optimization_goal: Optional[Literal["sharpe", "risk", "return", "income"]] = Field("sharpe", description="Optimization objective")
    esg_preferences: Optional[ESGPreferences] = Field(None, description="ESG preferences")
    tax_preferences: Optional[TaxPreferences] = Field(None, description="Tax preferences")
    sector_preferences: Optional[SectorPreferences] = Field(None, description="Sector preferences")
    use_ai_optimization: bool = Field(True, description="Whether to use AI-powered optimization")
    
    def get_risk_bounds(self) -> List[tuple]:
        """Get risk-adjusted allocation bounds"""
        if self.risk_tolerance == "low":
            return [(0, 0.5), (0.2, 0.8), (0, 0.2), (0, 0.3)]  # Conservative
        elif self.risk_tolerance == "medium":
            return [(0.1, 0.8), (0.1, 0.6), (0, 0.3), (0, 0.2)]  # Moderate
        else:  # high
            return [(0.3, 0.9), (0, 0.4), (0, 0.4), (0, 0.1)]   # Aggressive

class RiskMetrics(BaseModel):
    """
    Portfolio risk and return metrics
    
    Comprehensive risk analysis results including volatility, risk-adjusted returns,
    and diversification measures.
    """
    volatility: float = Field(description="Portfolio volatility (annualized %)")
    sharpe_ratio: float = Field(description="Sharpe ratio (risk-adjusted return)")
    max_drawdown: float = Field(description="Maximum drawdown estimate (%)")
    diversification_score: float = Field(ge=0, le=100, description="Diversification score (0-100)")
    expected_return: float = Field(description="Expected annual return (%)")
    
    # Additional metrics for enhanced analysis
    sortino_ratio: Optional[float] = Field(None, description="Sortino ratio (downside risk-adjusted return)")
    calmar_ratio: Optional[float] = Field(None, description="Calmar ratio (return/max drawdown)")
    value_at_risk_95: Optional[float] = Field(None, description="Value at Risk at 95% confidence level")
    conditional_var_95: Optional[float] = Field(None, description="Conditional Value at Risk at 95% confidence level")
    
    def get_risk_grade(self) -> str:
        """Get letter grade for overall risk level"""
        if self.volatility < 5:
            return "A"  # Very Low Risk
        elif self.volatility < 10:
            return "B"  # Low Risk
        elif self.volatility < 15:
            return "C"  # Moderate Risk
        elif self.volatility < 20:
            return "D"  # High Risk
        else:
            return "F"  # Very High Risk

class OptimizationResult(BaseModel):
    """
    Portfolio optimization results
    
    Complete optimization output including optimized allocation, metrics comparison,
    and actionable recommendations.
    """
    optimized_allocation: PortfolioAllocation
    current_metrics: RiskMetrics
    optimized_metrics: RiskMetrics
    recommendations: List[str] = Field(description="Actionable investment recommendations")
    explanations: List[str] = Field(description="Educational explanations of results")
    
    # Additional optimization metadata
    optimization_method: Optional[str] = Field(None, description="Method used for optimization")
    convergence_status: Optional[str] = Field(None, description="Optimization convergence status")
    iterations: Optional[int] = Field(None, description="Number of optimization iterations")
    computation_time: Optional[float] = Field(None, description="Computation time in seconds")
    
    def get_improvement_summary(self) -> Dict[str, float]:
        """Get summary of improvements from optimization"""
        return {
            "return_improvement": self.optimized_metrics.expected_return - self.current_metrics.expected_return,
            "risk_reduction": self.current_metrics.volatility - self.optimized_metrics.volatility,
            "sharpe_improvement": self.optimized_metrics.sharpe_ratio - self.current_metrics.sharpe_ratio,
            "diversification_improvement": self.optimized_metrics.diversification_score - self.current_metrics.diversification_score
        }

class AssetClass(BaseModel):
    """
    Asset class definition with characteristics
    
    Defines the properties of each asset class used in optimization including
    expected returns, risks, and additional factors.
    """
    name: str = Field(description="Asset class identifier")
    display_name: str = Field(description="Human-readable name")
    expected_return: float = Field(description="Expected annual return (%)")
    volatility: float = Field(description="Volatility (standard deviation %)")
    description: str = Field(description="Asset class description")
    
    # Extended characteristics for advanced optimization
    esg_score: Optional[float] = Field(None, ge=0, le=1, description="ESG score (0-1)")
    tax_efficiency: Optional[float] = Field(None, ge=0, le=1, description="Tax efficiency (0-1)")
    liquidity: Optional[float] = Field(None, ge=0, le=1, description="Liquidity score (0-1)")
    inflation_protection: Optional[float] = Field(None, ge=0, le=1, description="Inflation protection (0-1)")
    
    # Sector exposure (for stocks and alternatives)
    sector_exposure: Optional[Dict[str, float]] = Field(None, description="Sector exposure breakdown")
    
    def get_risk_return_ratio(self) -> float:
        """Calculate simple risk-return ratio"""
        return self.expected_return / self.volatility if self.volatility > 0 else 0

class MarketScenario(BaseModel):
    """
    Market scenario for stress testing
    
    Defines market conditions for scenario analysis and stress testing.
    """
    name: str = Field(description="Scenario name")
    description: str = Field(description="Scenario description")
    probability: float = Field(ge=0, le=1, description="Scenario probability (0-1)")
    
    # Asset class returns under this scenario
    asset_returns: Dict[str, float] = Field(description="Asset class returns under scenario")
    
    # Market condition modifiers
    volatility_multiplier: float = Field(1.0, ge=0, description="Volatility multiplier for scenario")
    correlation_adjustment: float = Field(0.0, ge=-1, le=1, description="Correlation adjustment (-1 to 1)")

class OptimizationConstraints(BaseModel):
    """
    Advanced optimization constraints
    
    Defines additional constraints for sophisticated portfolio optimization.
    """
    min_allocation: Optional[PortfolioAllocation] = Field(None, description="Minimum allocations")
    max_allocation: Optional[PortfolioAllocation] = Field(None, description="Maximum allocations")
    
    # Turnover constraints
    max_turnover: Optional[float] = Field(None, ge=0, le=1, description="Maximum portfolio turnover")
    transaction_costs: Optional[float] = Field(None, ge=0, description="Transaction cost percentage")
    
    # Risk constraints
    max_volatility: Optional[float] = Field(None, ge=0, description="Maximum portfolio volatility")
    max_drawdown_constraint: Optional[float] = Field(None, ge=0, le=1, description="Maximum drawdown constraint")
    
    # ESG constraints
    min_esg_score: Optional[float] = Field(None, ge=0, le=1, description="Minimum ESG score")
    
    def validate_constraints(self, allocation: PortfolioAllocation) -> bool:
        """Validate if allocation meets constraints"""
        if self.min_allocation:
            min_arr = self.min_allocation.to_numpy()
            if np.any(allocation.to_numpy() < min_arr):
                return False
        
        if self.max_allocation:
            max_arr = self.max_allocation.to_numpy()
            if np.any(allocation.to_numpy() > max_arr):
                return False
        
        return True

# Model configuration for better JSON serialization
for model in [PortfolioAllocation, ESGPreferences, TaxPreferences, SectorPreferences, 
              PortfolioInput, RiskMetrics, OptimizationResult, AssetClass, 
              MarketScenario, OptimizationConstraints]:
    model.model_config = {
        "json_encoders": {
            np.ndarray: lambda v: v.tolist(),
            datetime: lambda v: v.isoformat(),
        },
        "str_strip_whitespace": True,
        "validate_assignment": True,
    }