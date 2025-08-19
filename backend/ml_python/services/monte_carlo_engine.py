"""Monte Carlo Simulation Engine for Portfolio Forecasting"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from datetime import datetime, date, timedelta
from scipy import stats
import logging

from models.forecasting_models import (
    HoldingInfo, MonteCarloResults, MonteCarloSummary, HistoricalDataPoint
)

logger = logging.getLogger(__name__)

class MonteCarloEngine:
    
    def __init__(self):
        self.risk_free_rate = 0.02  # 2% risk-free rate
        
    def run_monte_carlo_simulation(
        self,
        holdings: List[HoldingInfo],
        historical_data: Dict[str, List[HistoricalDataPoint]],
        time_horizon: str,
        num_simulations: int = 5000
    ) -> MonteCarloResults:
        """
        Run Monte Carlo simulation for portfolio forecasting
        
        Args:
            holdings: List of portfolio holdings
            historical_data: Historical price data for each asset
            time_horizon: Forecast time horizon
            num_simulations: Number of Monte Carlo simulations to run
            
        Returns:
            MonteCarloResults with comprehensive simulation outcomes
        """
        try:
            logger.info(f"🎲 Running Monte Carlo simulation with {num_simulations} iterations")
            
            # Calculate simulation parameters for each asset
            asset_params = self._calculate_asset_parameters(holdings, historical_data)
            
            # Get simulation period
            days_ahead = self._get_simulation_days(time_horizon)
            
            # Run simulations
            simulation_results = self._run_simulations(
                holdings, asset_params, days_ahead, num_simulations
            )
            
            # Calculate portfolio outcomes
            portfolio_outcomes = self._calculate_portfolio_outcomes(
                simulation_results, holdings, days_ahead
            )
            
            # Generate Monte Carlo results
            mc_results = self._generate_monte_carlo_results(
                portfolio_outcomes, num_simulations, holdings
            )
            
            logger.info("✅ Monte Carlo simulation completed successfully")
            return mc_results
            
        except Exception as e:
            logger.error(f"❌ Monte Carlo simulation failed: {str(e)}")
            raise
    
    def _calculate_asset_parameters(
        self, holdings: List[HoldingInfo], historical_data: Dict[str, List[HistoricalDataPoint]]
    ) -> Dict[str, Dict[str, float]]:
        """Calculate mean return and volatility for each asset"""
        
        asset_params = {}
        
        for holding in holdings:
            ticker = holding.ticker
            hist_data = historical_data.get(ticker, [])
            
            if len(hist_data) < 30:
                # Use default parameters if insufficient data
                asset_params[ticker] = {
                    'mean_return': 0.0008,  # ~20% annually
                    'volatility': 0.02,     # ~30% annually
                    'current_price': holding.current_price
                }
                logger.warning(f"⚠️ Using default parameters for {ticker} due to insufficient data")
            else:
                # Calculate returns from historical data
                prices = [point.price for point in hist_data]
                returns = np.diff(np.log(prices))  # Log returns
                
                mean_return = np.mean(returns)
                volatility = np.std(returns)
                
                # Annualize the parameters
                asset_params[ticker] = {
                    'mean_return': mean_return,
                    'volatility': volatility,
                    'current_price': holding.current_price
                }
                
                logger.debug(f"📊 {ticker}: mean_return={mean_return:.4f}, volatility={volatility:.4f}")
        
        return asset_params
    
    def _get_simulation_days(self, time_horizon: str) -> int:
        """Get number of days for simulation"""
        return {
            "1_month": 30,
            "3_months": 90,
            "1_year": 365
        }[time_horizon]
    
    def _run_simulations(
        self, holdings: List[HoldingInfo], asset_params: Dict[str, Dict[str, float]], 
        days_ahead: int, num_simulations: int
    ) -> Dict[str, np.ndarray]:
        """Run Monte Carlo simulations for all assets"""
        
        simulation_results = {}
        
        for holding in holdings:
            ticker = holding.ticker
            params = asset_params[ticker]
            
            # Generate random returns using geometric Brownian motion
            np.random.seed(42)  # For reproducible results
            
            # Generate random daily returns
            random_returns = np.random.normal(
                params['mean_return'], 
                params['volatility'], 
                (num_simulations, days_ahead)
            )
            
            # Calculate price paths using geometric Brownian motion
            initial_price = params['current_price']
            price_paths = np.zeros((num_simulations, days_ahead + 1))
            price_paths[:, 0] = initial_price
            
            for day in range(days_ahead):
                price_paths[:, day + 1] = price_paths[:, day] * np.exp(random_returns[:, day])
            
            simulation_results[ticker] = price_paths
            
            logger.debug(f"📈 Generated {num_simulations} price paths for {ticker}")
        
        return simulation_results
    
    def _calculate_portfolio_outcomes(
        self, simulation_results: Dict[str, np.ndarray], holdings: List[HoldingInfo], days_ahead: int
    ) -> np.ndarray:
        """Calculate portfolio value outcomes from individual asset simulations"""
        
        num_simulations = next(iter(simulation_results.values())).shape[0]
        portfolio_outcomes = np.zeros((num_simulations, days_ahead + 1))
        
        # Calculate initial portfolio value
        initial_portfolio_value = sum(holding.market_value for holding in holdings)
        portfolio_outcomes[:, 0] = initial_portfolio_value
        
        # Calculate portfolio value for each simulation and day
        for day in range(1, days_ahead + 1):
            for holding in holdings:
                ticker = holding.ticker
                quantity = holding.quantity
                
                # Get simulated prices for this day
                simulated_prices = simulation_results[ticker][:, day]
                
                # Add contribution to portfolio value
                portfolio_outcomes[:, day] += quantity * simulated_prices
        
        return portfolio_outcomes
    
    def _generate_monte_carlo_results(
        self, portfolio_outcomes: np.ndarray, num_simulations: int, holdings: List[HoldingInfo]
    ) -> MonteCarloResults:
        """Generate comprehensive Monte Carlo results"""
        
        initial_value = portfolio_outcomes[0, 0]
        final_values = portfolio_outcomes[:, -1]
        
        # Calculate percentiles for the final day
        percentiles = {
            5: np.percentile(final_values, 5),
            25: np.percentile(final_values, 25),
            50: np.percentile(final_values, 50),
            75: np.percentile(final_values, 75),
            95: np.percentile(final_values, 95)
        }
        
        # Calculate percentile time series
        percentile_series = {}
        for p in [5, 25, 50, 75, 95]:
            percentile_series[p] = [
                np.percentile(portfolio_outcomes[:, day], p) 
                for day in range(portfolio_outcomes.shape[1])
            ]
        
        # Calculate probabilities
        returns = (final_values - initial_value) / initial_value
        prob_positive = np.mean(returns > 0)
        prob_loss_5 = np.mean(returns <= -0.05)
        prob_loss_10 = np.mean(returns <= -0.10)
        prob_gain_10 = np.mean(returns >= 0.10)
        prob_gain_20 = np.mean(returns >= 0.20)
        
        # Calculate risk metrics
        expected_value = np.mean(final_values)
        var_5 = np.percentile(final_values, 5)
        var_1 = np.percentile(final_values, 1)
        cvar = np.mean(final_values[final_values <= var_5])
        
        # Generate simulation summary
        simulation_summary = self._generate_simulation_summary(portfolio_outcomes, initial_value)
        
        return MonteCarloResults(
            num_simulations=num_simulations,
            percentile_5=percentile_series[5],
            percentile_25=percentile_series[25],
            percentile_50=percentile_series[50],
            percentile_75=percentile_series[75],
            percentile_95=percentile_series[95],
            probability_positive=round(prob_positive, 4),
            probability_loss_5_percent=round(prob_loss_5, 4),
            probability_loss_10_percent=round(prob_loss_10, 4),
            probability_gain_10_percent=round(prob_gain_10, 4),
            probability_gain_20_percent=round(prob_gain_20, 4),
            expected_value=round(expected_value, 2),
            value_at_risk_5=round(var_5, 2),
            value_at_risk_1=round(var_1, 2),
            conditional_value_at_risk=round(cvar, 2),
            simulation_summary=simulation_summary
        )
    
    def _generate_simulation_summary(self, portfolio_outcomes: np.ndarray, initial_value: float) -> MonteCarloSummary:
        """Generate comprehensive simulation summary with advanced metrics"""
        
        final_values = portfolio_outcomes[:, -1]
        returns = (final_values - initial_value) / initial_value
        
        # Basic statistics
        mean_return = np.mean(returns)
        volatility = np.std(returns)
        skewness = stats.skew(returns)
        kurtosis = stats.kurtosis(returns)
        
        # Risk-adjusted metrics
        sharpe_ratio = (mean_return - self.risk_free_rate) / volatility if volatility > 0 else 0
        downside_returns = returns[returns < 0]
        downside_deviation = np.std(downside_returns) if len(downside_returns) > 0 else 0
        
        # Maximum drawdown calculation
        cumulative_returns = np.cumprod(1 + returns.reshape(-1, 1))
        running_max = np.maximum.accumulate(cumulative_returns, axis=0)
        drawdowns = (cumulative_returns - running_max) / running_max
        max_drawdown = np.min(drawdowns)
        
        # Confidence intervals
        confidence_intervals = {
            "95%": {
                "lower": float(np.percentile(returns, 2.5)),
                "upper": float(np.percentile(returns, 97.5))
            },
            "90%": {
                "lower": float(np.percentile(returns, 5)),
                "upper": float(np.percentile(returns, 95))
            },
            "68%": {
                "lower": float(np.percentile(returns, 16)),
                "upper": float(np.percentile(returns, 84))
            }
        }
        
        # Additional risk metrics
        risk_metrics = {
            "sortino_ratio": float(mean_return / downside_deviation if downside_deviation > 0 else 0),
            "calmar_ratio": float(mean_return / abs(max_drawdown) if max_drawdown < 0 else 0),
            "tail_ratio": float(np.percentile(returns, 95) / abs(np.percentile(returns, 5))),
            "gain_loss_ratio": float(np.mean(returns[returns > 0]) / abs(np.mean(returns[returns < 0])) if len(returns[returns < 0]) > 0 else 0)
        }
        
        return MonteCarloSummary(
            mean_return=round(mean_return, 4),
            volatility=round(volatility, 4),
            skewness=round(skewness, 4),
            kurtosis=round(kurtosis, 4),
            sharpe_ratio=round(sharpe_ratio, 4),
            downside_deviation=round(downside_deviation, 4),
            maximum_drawdown=round(max_drawdown, 4),
            confidence_intervals=confidence_intervals,
            risk_metrics=risk_metrics
        )
    
    def generate_monte_carlo_insights(self, mc_results: MonteCarloResults, initial_value: float) -> List[str]:
        """Generate human-readable insights from Monte Carlo results"""
        
        insights = []
        
        # Probability insights
        if mc_results.probability_positive > 0.7:
            insights.append(f"🎯 High probability of positive returns: {mc_results.probability_positive:.1%} chance of gains")
        elif mc_results.probability_positive < 0.4:
            insights.append(f"⚠️ Lower probability of positive returns: {mc_results.probability_positive:.1%} chance of gains")
        
        # Risk insights
        if mc_results.probability_loss_10_percent > 0.2:
            insights.append(f"🔻 Significant downside risk: {mc_results.probability_loss_10_percent:.1%} chance of losing 10% or more")
        
        if mc_results.probability_gain_20_percent > 0.25:
            insights.append(f"🚀 Strong upside potential: {mc_results.probability_gain_20_percent:.1%} chance of gaining 20% or more")
        
        # Value at Risk insights
        var_loss_pct = ((initial_value - mc_results.value_at_risk_5) / initial_value) * 100
        if var_loss_pct > 10:
            insights.append(f"⚠️ High tail risk: 5% chance of losing ${mc_results.value_at_risk_5:,.0f} or more (worst 5% of outcomes)")
        
        # Expected value insights
        expected_return_pct = ((mc_results.expected_value - initial_value) / initial_value) * 100
        if expected_return_pct > 5:
            insights.append(f"📈 Positive expected outcome: Average projected return of {expected_return_pct:.1f}%")
        elif expected_return_pct < -2:
            insights.append(f"📉 Negative expected outcome: Average projected return of {expected_return_pct:.1f}%")
        
        # Volatility insights
        if mc_results.simulation_summary.volatility > 0.3:
            insights.append("🌪️ High volatility expected: Wide range of possible outcomes")
        elif mc_results.simulation_summary.volatility < 0.1:
            insights.append("📊 Low volatility expected: Relatively stable outcomes")
        
        # Sharpe ratio insights
        if mc_results.simulation_summary.sharpe_ratio > 1.0:
            insights.append("⭐ Excellent risk-adjusted returns expected")
        elif mc_results.simulation_summary.sharpe_ratio < 0.5:
            insights.append("📉 Poor risk-adjusted returns expected")
        
        # Skewness insights
        if mc_results.simulation_summary.skewness > 0.5:
            insights.append("📈 Positively skewed outcomes: More upside potential than downside risk")
        elif mc_results.simulation_summary.skewness < -0.5:
            insights.append("📉 Negatively skewed outcomes: More downside risk than upside potential")
        
        return insights[:8]  # Limit to 8 most relevant insights