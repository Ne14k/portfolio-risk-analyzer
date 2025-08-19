"""Forecasting data models"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Literal
from datetime import datetime, date
import numpy as np

class ForecastRequest(BaseModel):
    holdings: List['HoldingInfo']
    time_horizon: Literal["1_month", "3_months", "1_year"] = Field(description="Forecasting time horizon")
    include_scenarios: bool = Field(True, description="Include best/worst case scenarios")
    include_monte_carlo: bool = Field(True, description="Include Monte Carlo simulations")
    monte_carlo_simulations: int = Field(5000, ge=1000, le=10000, description="Number of Monte Carlo simulations")
    
    @validator('holdings')
    def validate_holdings(cls, v):
        if not v:
            raise ValueError('At least one holding is required')
        return v

class HoldingInfo(BaseModel):
    ticker: str = Field(description="Stock ticker symbol")
    name: str = Field(description="Asset name")
    quantity: float = Field(gt=0, description="Number of shares/units")
    current_price: float = Field(gt=0, description="Current price per share")
    market_value: float = Field(gt=0, description="Total market value")

class HistoricalDataPoint(BaseModel):
    date: date
    price: float
    volume: Optional[int] = None

class AssetForecast(BaseModel):
    ticker: str
    current_price: float
    forecasted_prices: List['ForecastPoint']
    confidence_interval: Optional['ConfidenceInterval'] = None
    model_metrics: 'ModelMetrics'

class ForecastPoint(BaseModel):
    date: date
    predicted_price: float
    portfolio_value_contribution: float

class ConfidenceInterval(BaseModel):
    lower_bound: List[float]
    upper_bound: List[float]
    confidence_level: float = 0.95

class ModelMetrics(BaseModel):
    r_squared: float
    mse: float
    mae: float
    training_period_days: int

class PortfolioForecast(BaseModel):
    current_total_value: float
    forecast_data: List['PortfolioForecastPoint']
    individual_assets: List[AssetForecast]
    scenarios: Optional['ScenarioAnalysis'] = None
    monte_carlo_results: Optional['MonteCarloResults'] = None
    summary: 'ForecastSummary'

class PortfolioForecastPoint(BaseModel):
    date: date
    total_value: float
    gain_loss: float
    gain_loss_percentage: float

class ScenarioAnalysis(BaseModel):
    best_case: List[PortfolioForecastPoint]
    worst_case: List[PortfolioForecastPoint]
    confidence_level: float = 0.95

class MonteCarloResults(BaseModel):
    num_simulations: int
    percentile_5: List[float]  # 5th percentile outcomes
    percentile_25: List[float]  # 25th percentile outcomes
    percentile_50: List[float]  # 50th percentile (median) outcomes
    percentile_75: List[float]  # 75th percentile outcomes
    percentile_95: List[float]  # 95th percentile outcomes
    
    probability_positive: float = Field(description="Probability of positive returns")
    probability_loss_5_percent: float = Field(description="Probability of losing 5% or more")
    probability_loss_10_percent: float = Field(description="Probability of losing 10% or more")
    probability_gain_10_percent: float = Field(description="Probability of gaining 10% or more")
    probability_gain_20_percent: float = Field(description="Probability of gaining 20% or more")
    
    expected_value: float = Field(description="Expected final portfolio value")
    value_at_risk_5: float = Field(description="Value at Risk at 5% level")
    value_at_risk_1: float = Field(description="Value at Risk at 1% level")
    conditional_value_at_risk: float = Field(description="Conditional Value at Risk")
    
    simulation_summary: 'MonteCarloSummary'

class MonteCarloSummary(BaseModel):
    mean_return: float
    volatility: float
    skewness: float
    kurtosis: float
    sharpe_ratio: float
    downside_deviation: float
    maximum_drawdown: float
    
    confidence_intervals: Dict[str, Dict[str, float]] = Field(
        description="Confidence intervals for various metrics"
    )
    
    risk_metrics: Dict[str, float] = Field(
        description="Additional risk metrics from Monte Carlo"
    )

class ForecastSummary(BaseModel):
    time_horizon: str
    initial_value: float
    final_projected_value: float
    total_projected_gain: float
    total_projected_gain_percentage: float
    annualized_return: float
    forecast_generated_at: datetime
    
    best_case_final_value: Optional[float] = None
    worst_case_final_value: Optional[float] = None
    
    top_performers: List[str] = Field(default_factory=list)
    underperformers: List[str] = Field(default_factory=list)
    
    monte_carlo_insights: List[str] = Field(default_factory=list, description="Key insights from Monte Carlo simulation")

class ForecastingError(BaseModel):
    ticker: str
    error_type: str
    message: str
    
ForecastRequest.model_rebuild()
AssetForecast.model_rebuild()
PortfolioForecast.model_rebuild()