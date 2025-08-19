"""Risk Analysis Service"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import asyncio
from scipy import stats
from scipy.stats import norm
import logging

from models.portfolio_models import PortfolioAllocation, RiskMetrics
from utils.market_data import MarketDataProvider

logger = logging.getLogger(__name__)

class RiskAnalyzer:
    
    def __init__(self, market_data_provider: MarketDataProvider):
        self.market_data = market_data_provider
        self.risk_free_rate = 0.02
        
    async def calculate_portfolio_metrics(self, allocation: PortfolioAllocation) -> RiskMetrics:
        try:
            logger.info(f"🔍 Calculating portfolio metrics for allocation: {allocation}")
            
            weights = allocation.to_numpy()
            
            if not self._validate_weights(weights):
                raise ValueError("Invalid portfolio weights")
            
            asset_data = await self.market_data.get_asset_data()
            correlation_matrix = await self.market_data.get_correlation_matrix()
            
            returns = np.array([asset_data[asset]["return"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            volatilities = np.array([asset_data[asset]["volatility"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            
            portfolio_return = self._calculate_portfolio_return(weights, returns)
            portfolio_volatility = self._calculate_portfolio_volatility(weights, volatilities, correlation_matrix)
            sharpe_ratio = self._calculate_sharpe_ratio(portfolio_return, portfolio_volatility)
            
            max_drawdown = self._estimate_max_drawdown(portfolio_volatility)
            diversification_score = self._calculate_diversification_score(weights)
            
            sortino_ratio = self._calculate_sortino_ratio(portfolio_return, portfolio_volatility)
            calmar_ratio = self._calculate_calmar_ratio(portfolio_return, max_drawdown)
            var_95 = self._calculate_value_at_risk(portfolio_return, portfolio_volatility, 0.05)
            cvar_95 = self._calculate_conditional_var(portfolio_return, portfolio_volatility, 0.05)
            metrics = RiskMetrics(
                volatility=round(portfolio_volatility * 100, 2),
                sharpe_ratio=round(sharpe_ratio, 3),
                max_drawdown=round(max_drawdown * 100, 2),
                diversification_score=round(diversification_score, 1),
                expected_return=round(portfolio_return * 100, 2),
                sortino_ratio=round(sortino_ratio, 3),
                calmar_ratio=round(calmar_ratio, 3),
                value_at_risk_95=round(var_95 * 100, 2),
                conditional_var_95=round(cvar_95 * 100, 2)
            )
            
            logger.info(f"✅ Portfolio metrics calculated successfully")
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Error calculating portfolio metrics: {str(e)}")
            # Return safe default metrics
            return self._get_default_metrics()
    
    def _validate_weights(self, weights: np.ndarray) -> bool:
        """Validate portfolio weights"""
        if len(weights) != 4:
            return False
        if np.any(weights < 0) or np.any(weights > 1):
            return False
        if abs(np.sum(weights) - 1.0) > 0.01:
            return False
        return True
    
    def _calculate_portfolio_return(self, weights: np.ndarray, returns: np.ndarray) -> float:
        """Calculate expected portfolio return"""
        portfolio_return = np.dot(weights, returns)
        
        # Ensure reasonable bounds
        if not np.isfinite(portfolio_return):
            portfolio_return = 0.05  # Default 5% return
        
        return max(0, min(portfolio_return, 0.5))  # Cap between 0% and 50%
    
    def _calculate_portfolio_volatility(self, weights: np.ndarray, volatilities: np.ndarray, 
                                      correlation_matrix: np.ndarray) -> float:
        """Calculate portfolio volatility using covariance matrix"""
        try:
            # Build covariance matrix
            cov_matrix = np.diag(volatilities) @ correlation_matrix @ np.diag(volatilities)
            
            # Add numerical stability
            cov_matrix += np.eye(len(cov_matrix)) * 1e-8
            
            # Calculate portfolio variance
            portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
            
            # Handle negative variance (numerical errors)
            if portfolio_variance < 0:
                portfolio_variance = abs(portfolio_variance)
            
            portfolio_volatility = np.sqrt(portfolio_variance)
            
            # Ensure minimum volatility
            if portfolio_volatility < 1e-8:
                portfolio_volatility = 1e-8
            
            return portfolio_volatility
            
        except Exception as e:
            logger.warning(f"Covariance calculation failed: {e}, using fallback method")
            # Fallback: weighted average volatility
            return np.dot(weights, volatilities)
    
    def _calculate_sharpe_ratio(self, portfolio_return: float, portfolio_volatility: float) -> float:
        """Calculate Sharpe ratio"""
        try:
            if portfolio_volatility == 0:
                return 0.0
            
            sharpe = (portfolio_return - self.risk_free_rate) / portfolio_volatility
            
            if not np.isfinite(sharpe):
                return 0.0
            
            return sharpe
            
        except Exception:
            return 0.0
    
    def _calculate_sortino_ratio(self, portfolio_return: float, portfolio_volatility: float) -> float:
        """Calculate Sortino ratio (downside risk-adjusted return)"""
        try:
            # Estimate downside deviation (simplified)
            downside_volatility = portfolio_volatility * 0.7  # Approximate downside volatility
            
            if downside_volatility == 0:
                return 0.0
            
            sortino = (portfolio_return - self.risk_free_rate) / downside_volatility
            
            if not np.isfinite(sortino):
                return 0.0
            
            return sortino
            
        except Exception:
            return 0.0
    
    def _calculate_calmar_ratio(self, portfolio_return: float, max_drawdown: float) -> float:
        """Calculate Calmar ratio (return/max drawdown)"""
        try:
            if max_drawdown == 0:
                return 0.0
            
            calmar = portfolio_return / max_drawdown
            
            if not np.isfinite(calmar):
                return 0.0
            
            return calmar
            
        except Exception:
            return 0.0
    
    def _estimate_max_drawdown(self, portfolio_volatility: float) -> float:
        """Estimate maximum drawdown based on volatility"""
        try:
            # Use volatility-based estimation
            # Higher volatility typically leads to higher drawdowns
            max_drawdown = min(portfolio_volatility * 2.5, 0.5)  # Cap at 50%
            
            return max(0.01, max_drawdown)  # Minimum 1% drawdown
            
        except Exception:
            return 0.15  # Default 15% drawdown
    
    def _calculate_diversification_score(self, weights: np.ndarray) -> float:
        """Calculate diversification score using Herfindahl index"""
        try:
            # Herfindahl-Hirschman Index (HHI)
            hhi = np.sum(weights ** 2)
            
            # Convert to diversification score (0-100)
            diversification_score = (1 - hhi) * 100
            
            # Ensure bounds
            return max(0, min(100, diversification_score))
            
        except Exception:
            return 50.0  # Default moderate diversification
    
    def _calculate_value_at_risk(self, portfolio_return: float, portfolio_volatility: float, 
                               confidence_level: float) -> float:
        """Calculate Value at Risk (VaR) at given confidence level"""
        try:
            # Use normal distribution assumption
            z_score = norm.ppf(confidence_level)
            var = portfolio_return + z_score * portfolio_volatility
            
            return var
            
        except Exception:
            return -0.1  # Default -10% VaR
    
    def _calculate_conditional_var(self, portfolio_return: float, portfolio_volatility: float, 
                                 confidence_level: float) -> float:
        """Calculate Conditional Value at Risk (CVaR)"""
        try:
            # Simplified CVaR calculation
            z_score = norm.ppf(confidence_level)
            cvar = portfolio_return - (portfolio_volatility * norm.pdf(z_score) / confidence_level)
            
            return cvar
            
        except Exception:
            return -0.15  # Default -15% CVaR
    
    def _get_default_metrics(self) -> RiskMetrics:
        """Return safe default metrics in case of calculation failure"""
        return RiskMetrics(
            volatility=10.0,
            sharpe_ratio=0.5,
            max_drawdown=15.0,
            diversification_score=50.0,
            expected_return=7.0,
            sortino_ratio=0.6,
            calmar_ratio=0.47,
            value_at_risk_95=-8.0,
            conditional_var_95=-12.0
        )
    
    async def perform_monte_carlo_risk_analysis(self, allocation: PortfolioAllocation, 
                                              num_simulations: int = 10000) -> Dict:
        """
        Perform Monte Carlo simulation for advanced risk analysis
        
        Args:
            allocation: Portfolio allocation
            num_simulations: Number of Monte Carlo simulations
            
        Returns:
            Dict: Monte Carlo simulation results
        """
        try:
            logger.info(f"🎲 Running Monte Carlo risk analysis with {num_simulations} simulations")
            
            weights = allocation.to_numpy()
            asset_data = await self.market_data.get_asset_data()
            correlation_matrix = await self.market_data.get_correlation_matrix()
            
            # Extract parameters
            returns = np.array([asset_data[asset]["return"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            volatilities = np.array([asset_data[asset]["volatility"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            
            # Build covariance matrix
            cov_matrix = np.diag(volatilities) @ correlation_matrix @ np.diag(volatilities)
            
            # Monte Carlo simulation
            portfolio_returns = []
            
            for _ in range(num_simulations):
                # Generate random returns from multivariate normal distribution
                random_returns = np.random.multivariate_normal(returns, cov_matrix)
                portfolio_return = np.dot(weights, random_returns)
                portfolio_returns.append(portfolio_return)
            
            portfolio_returns = np.array(portfolio_returns)
            
            # Calculate simulation statistics
            results = {
                "mean_return": float(np.mean(portfolio_returns)),
                "std_return": float(np.std(portfolio_returns)),
                "var_95": float(np.percentile(portfolio_returns, 5)),
                "var_99": float(np.percentile(portfolio_returns, 1)),
                "cvar_95": float(np.mean(portfolio_returns[portfolio_returns <= np.percentile(portfolio_returns, 5)])),
                "best_case": float(np.percentile(portfolio_returns, 95)),
                "worst_case": float(np.percentile(portfolio_returns, 5)),
                "probability_positive": float(np.mean(portfolio_returns > 0)),
                "probability_target": float(np.mean(portfolio_returns > 0.08)),  # 8% target return
                "simulations": num_simulations
            }
            
            logger.info(f"✅ Monte Carlo analysis completed")
            return results
            
        except Exception as e:
            logger.error(f"❌ Monte Carlo simulation failed: {str(e)}")
            raise
    
    async def calculate_stress_test_metrics(self, allocation: PortfolioAllocation) -> Dict:
        """
        Calculate portfolio performance under stress scenarios
        
        Args:
            allocation: Portfolio allocation
            
        Returns:
            Dict: Stress test results
        """
        try:
            logger.info("🧪 Running stress test analysis")
            
            weights = allocation.to_numpy()
            
            # Define stress scenarios
            stress_scenarios = {
                "2008_crisis": {
                    "stocks": -0.37,
                    "bonds": 0.05,
                    "alternatives": -0.25,
                    "cash": 0.01
                },
                "dot_com_bubble": {
                    "stocks": -0.49,
                    "bonds": 0.11,
                    "alternatives": -0.15,
                    "cash": 0.02
                },
                "covid_crash": {
                    "stocks": -0.34,
                    "bonds": 0.08,
                    "alternatives": -0.20,
                    "cash": 0.01
                },
                "inflation_shock": {
                    "stocks": -0.10,
                    "bonds": -0.15,
                    "alternatives": 0.05,
                    "cash": -0.02
                }
            }
            
            stress_results = {}
            
            for scenario_name, returns in stress_scenarios.items():
                scenario_returns = np.array([returns["stocks"], returns["bonds"], 
                                           returns["alternatives"], returns["cash"]])
                portfolio_return = np.dot(weights, scenario_returns)
                stress_results[scenario_name] = {
                    "portfolio_return": float(portfolio_return),
                    "return_pct": float(portfolio_return * 100)
                }
            
            # Calculate average stress performance
            avg_stress_return = np.mean([result["portfolio_return"] for result in stress_results.values()])
            
            stress_results["summary"] = {
                "average_stress_return": float(avg_stress_return),
                "worst_scenario": min(stress_results.keys(), key=lambda x: stress_results[x]["portfolio_return"]),
                "best_scenario": max(stress_results.keys(), key=lambda x: stress_results[x]["portfolio_return"]),
                "stress_resilience_score": float(max(0, min(100, (avg_stress_return + 0.3) * 250)))  # 0-100 scale
            }
            
            logger.info("✅ Stress test analysis completed")
            return stress_results
            
        except Exception as e:
            logger.error(f"❌ Stress test failed: {str(e)}")
            raise