"""Portfolio Optimization Service"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import asyncio
import random
from scipy.optimize import minimize, differential_evolution
from scipy.stats import norm
import logging

from models.portfolio_models import (
    PortfolioAllocation, ESGPreferences, TaxPreferences, 
    SectorPreferences, OptimizationConstraints
)
from utils.market_data import MarketDataProvider

logger = logging.getLogger(__name__)

class PortfolioOptimizer:
    
    def __init__(self, market_data_provider: MarketDataProvider):
        self.market_data = market_data_provider
        self.risk_free_rate = 0.02
        
    async def optimize_portfolio(
        self,
        current_allocation: PortfolioAllocation,
        risk_tolerance: str,
        target_return: Optional[float] = None,
        optimization_goal: str = "sharpe",
        esg_preferences: Optional[ESGPreferences] = None,
        tax_preferences: Optional[TaxPreferences] = None,
        sector_preferences: Optional[SectorPreferences] = None,
        use_ai_optimization: bool = True
    ) -> PortfolioAllocation:
        try:
            logger.info(f"🎯 Starting portfolio optimization for {risk_tolerance} risk tolerance")
            
            if use_ai_optimization:
                try:
                    if self._has_complex_constraints(esg_preferences, tax_preferences, sector_preferences):
                        logger.info("🧬 Using Genetic Algorithm for complex constraints")
                        result = await self._genetic_algorithm_optimization(
                            current_allocation, risk_tolerance, target_return, optimization_goal,
                            esg_preferences, tax_preferences, sector_preferences
                        )
                    else:
                        logger.info("🎲 Using Monte Carlo optimization")
                        result = await self._monte_carlo_optimization(
                            current_allocation, risk_tolerance, target_return, optimization_goal,
                            esg_preferences, tax_preferences, sector_preferences
                        )
                    
                    if result:
                        logger.info(f"✅ AI optimization successful")
                        return result
                        
                except Exception as e:
                    logger.warning(f"⚠️ AI optimization failed: {e}, falling back to traditional methods")
            
            logger.info("📊 Using traditional MPT optimization")
            result = await self._traditional_mpt_optimization(
                current_allocation, risk_tolerance, target_return, optimization_goal,
                esg_preferences, tax_preferences, sector_preferences
            )
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Portfolio optimization failed: {str(e)}")
            return self._get_fallback_allocation(risk_tolerance)
    
    def _has_complex_constraints(self, esg_preferences: Optional[ESGPreferences], 
                                tax_preferences: Optional[TaxPreferences],
                                sector_preferences: Optional[SectorPreferences]) -> bool:
        """Check if we have complex constraints that require genetic algorithm"""
        return any([
            esg_preferences and esg_preferences.overall_importance > 0.3,
            tax_preferences and tax_preferences.prefer_tax_efficient,
            sector_preferences and sector_preferences.get_sector_constraints()
        ])
    
    async def _monte_carlo_optimization(
        self,
        current_allocation: PortfolioAllocation,
        risk_tolerance: str,
        target_return: Optional[float],
        optimization_goal: str,
        esg_preferences: Optional[ESGPreferences],
        tax_preferences: Optional[TaxPreferences],
        sector_preferences: Optional[SectorPreferences],
        num_simulations: int = 10000
    ) -> Optional[PortfolioAllocation]:
        """
        Monte Carlo optimization with AI-powered simulation
        
        Runs thousands of portfolio simulations to find optimal allocation
        using intelligent sampling and multi-objective scoring.
        """
        try:
            logger.info(f"🎲 Running Monte Carlo optimization with {num_simulations} simulations")
            
            # Get market data
            asset_data = await self.market_data.get_asset_data()
            correlation_matrix = await self.market_data.get_correlation_matrix()
            
            # Extract market parameters
            returns = np.array([asset_data[asset]["return"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            volatilities = np.array([asset_data[asset]["volatility"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            
            # Build covariance matrix
            cov_matrix = np.diag(volatilities) @ correlation_matrix @ np.diag(volatilities)
            cov_matrix += np.eye(len(cov_matrix)) * 1e-8  # Numerical stability
            
            # Get risk-based bounds
            bounds = self._get_risk_bounds(risk_tolerance)
            
            # Monte Carlo simulation
            best_allocation = None
            best_score = float('-inf')
            
            for simulation in range(num_simulations):
                try:
                    # Generate random allocation within bounds
                    weights = self._generate_random_allocation(bounds)
                    
                    # Calculate portfolio metrics
                    portfolio_return = np.dot(weights, returns)
                    portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
                    portfolio_volatility = np.sqrt(max(portfolio_variance, 1e-8))
                    
                    # Calculate composite score
                    score = await self._calculate_composite_score(
                        weights, portfolio_return, portfolio_volatility,
                        optimization_goal, esg_preferences, tax_preferences, 
                        sector_preferences, current_allocation
                    )
                    
                    # Track best allocation
                    if score > best_score:
                        best_score = score
                        best_allocation = weights.copy()
                        
                except Exception:
                    continue  # Skip problematic simulations
            
            if best_allocation is not None:
                return PortfolioAllocation.from_numpy(best_allocation)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Monte Carlo optimization failed: {str(e)}")
            return None
    
    async def _genetic_algorithm_optimization(
        self,
        current_allocation: PortfolioAllocation,
        risk_tolerance: str,
        target_return: Optional[float],
        optimization_goal: str,
        esg_preferences: Optional[ESGPreferences],
        tax_preferences: Optional[TaxPreferences],
        sector_preferences: Optional[SectorPreferences]
    ) -> Optional[PortfolioAllocation]:
        """
        Genetic algorithm optimization using differential evolution
        
        Uses evolutionary algorithms to find optimal portfolio allocation
        with advanced constraint handling and multi-objective optimization.
        """
        try:
            logger.info("🧬 Running Genetic Algorithm optimization")
            
            # Get market data
            asset_data = await self.market_data.get_asset_data()
            correlation_matrix = await self.market_data.get_correlation_matrix()
            
            # Extract market parameters
            returns = np.array([asset_data[asset]["return"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            volatilities = np.array([asset_data[asset]["volatility"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            
            # Build covariance matrix
            cov_matrix = np.diag(volatilities) @ correlation_matrix @ np.diag(volatilities)
            cov_matrix += np.eye(len(cov_matrix)) * 1e-8
            
            # Define fitness function
            async def fitness_function(weights):
                """Fitness function for genetic algorithm"""
                try:
                    # Normalize weights
                    weights = np.abs(weights)
                    weights = weights / np.sum(weights)
                    
                    # Calculate portfolio metrics
                    portfolio_return = np.dot(weights, returns)
                    portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
                    portfolio_volatility = np.sqrt(max(portfolio_variance, 1e-8))
                    
                    # Calculate composite score
                    score = await self._calculate_composite_score(
                        weights, portfolio_return, portfolio_volatility,
                        optimization_goal, esg_preferences, tax_preferences,
                        sector_preferences, current_allocation
                    )
                    
                    return -score  # Minimize negative score
                    
                except Exception:
                    return 1e10  # Penalty for invalid portfolios
            
            # Get optimization bounds
            bounds = self._get_risk_bounds(risk_tolerance)
            
            # Run differential evolution
            result = differential_evolution(
                lambda x: asyncio.run(fitness_function(x)),
                bounds,
                maxiter=100,
                popsize=15,
                seed=42,
                strategy='best1bin',
                atol=1e-8,
                workers=1  # Single threaded for async compatibility
            )
            
            if result.success:
                weights = np.abs(result.x)
                weights = weights / np.sum(weights)
                return PortfolioAllocation.from_numpy(weights)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Genetic algorithm optimization failed: {str(e)}")
            return None
    
    async def _traditional_mpt_optimization(
        self,
        current_allocation: PortfolioAllocation,
        risk_tolerance: str,
        target_return: Optional[float],
        optimization_goal: str,
        esg_preferences: Optional[ESGPreferences],
        tax_preferences: Optional[TaxPreferences],
        sector_preferences: Optional[SectorPreferences]
    ) -> PortfolioAllocation:
        """
        Traditional Modern Portfolio Theory optimization
        
        Uses classical MPT with scipy.optimize for portfolio optimization
        with risk-adjusted constraints and multi-objective support.
        """
        try:
            logger.info("📊 Running traditional MPT optimization")
            
            # Get market data
            asset_data = await self.market_data.get_asset_data()
            correlation_matrix = await self.market_data.get_correlation_matrix()
            
            # Extract market parameters
            returns = np.array([asset_data[asset]["return"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            volatilities = np.array([asset_data[asset]["volatility"] for asset in ["stocks", "bonds", "alternatives", "cash"]])
            
            # Build covariance matrix
            cov_matrix = np.diag(volatilities) @ correlation_matrix @ np.diag(volatilities)
            cov_matrix += np.eye(len(cov_matrix)) * 1e-8
            
            # Define objective function
            async def objective_function(weights):
                """Objective function for optimization"""
                try:
                    # Calculate portfolio metrics
                    portfolio_return = np.dot(weights, returns)
                    portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
                    portfolio_volatility = np.sqrt(max(portfolio_variance, 1e-8))
                    
                    # Calculate base objective
                    if optimization_goal == "sharpe":
                        base_objective = -(portfolio_return - self.risk_free_rate) / portfolio_volatility
                    elif optimization_goal == "return":
                        base_objective = -portfolio_return
                    elif optimization_goal == "risk":
                        base_objective = portfolio_variance
                    elif optimization_goal == "income":
                        # Weight bonds and income-generating assets
                        income_score = weights[1] * 0.7 + weights[2] * 0.3
                        base_objective = -income_score
                    else:
                        base_objective = portfolio_variance
                    
                    # Apply ESG adjustment
                    if esg_preferences and esg_preferences.overall_importance > 0:
                        esg_score = await self._calculate_esg_score(weights, esg_preferences)
                        esg_weight = esg_preferences.overall_importance
                        base_objective = base_objective * (1 - esg_weight) + (1 - esg_score) * esg_weight * 5
                    
                    # Apply tax efficiency adjustment
                    if tax_preferences and tax_preferences.prefer_tax_efficient:
                        tax_efficiency = await self._calculate_tax_efficiency(weights, tax_preferences)
                        base_objective = base_objective / tax_efficiency
                    
                    # Apply stability penalty for large changes
                    if current_allocation:
                        current_weights = current_allocation.to_numpy()
                        deviation = np.sum(np.abs(weights - current_weights))
                        if deviation > 0.3:
                            base_objective += (deviation - 0.3) * 2.0
                    
                    return base_objective
                    
                except Exception:
                    return 1e10
            
            # Set up constraints
            constraints = [
                {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}  # Weights sum to 1
            ]
            
            # Get bounds
            bounds = self._get_risk_bounds(risk_tolerance)
            
            # Initial guess
            if current_allocation:
                x0 = current_allocation.to_numpy()
            else:
                x0 = self._get_initial_guess(risk_tolerance)
            
            # Normalize initial guess
            x0 = x0 / np.sum(x0)
            
            # Multiple optimization attempts
            methods = ['SLSQP', 'trust-constr']
            
            for method in methods:
                try:
                    result = minimize(
                        lambda x: asyncio.run(objective_function(x)),
                        x0,
                        method=method,
                        bounds=bounds,
                        constraints=constraints,
                        options={'maxiter': 200, 'ftol': 1e-9}
                    )
                    
                    if result.success and self._validate_result(result.x):
                        weights = np.maximum(result.x, 0)
                        weights = weights / np.sum(weights)
                        return PortfolioAllocation.from_numpy(weights)
                        
                except Exception as e:
                    logger.warning(f"Method {method} failed: {e}")
                    continue
            
            # If all methods fail, return fallback
            return self._get_fallback_allocation(risk_tolerance)
            
        except Exception as e:
            logger.error(f"❌ Traditional MPT optimization failed: {str(e)}")
            return self._get_fallback_allocation(risk_tolerance)
    
    def _generate_random_allocation(self, bounds: List[Tuple[float, float]]) -> np.ndarray:
        """Generate random allocation within bounds"""
        weights = np.array([
            random.uniform(bounds[i][0], bounds[i][1]) for i in range(4)
        ])
        return weights / np.sum(weights)  # Normalize
    
    async def _calculate_composite_score(
        self,
        weights: np.ndarray,
        portfolio_return: float,
        portfolio_volatility: float,
        optimization_goal: str,
        esg_preferences: Optional[ESGPreferences],
        tax_preferences: Optional[TaxPreferences],
        sector_preferences: Optional[SectorPreferences],
        current_allocation: Optional[PortfolioAllocation]
    ) -> float:
        """Calculate composite optimization score"""
        try:
            # Base score calculation
            if optimization_goal == "sharpe":
                base_score = (portfolio_return - self.risk_free_rate) / portfolio_volatility
            elif optimization_goal == "return":
                base_score = portfolio_return
            elif optimization_goal == "risk":
                base_score = -portfolio_volatility
            elif optimization_goal == "income":
                base_score = weights[1] * 0.7 + weights[2] * 0.3  # Favor bonds and alternatives
            else:
                base_score = (portfolio_return - self.risk_free_rate) / portfolio_volatility
            
            # Apply ESG weighting
            if esg_preferences and esg_preferences.overall_importance > 0:
                esg_score = await self._calculate_esg_score(weights, esg_preferences)
                esg_weight = esg_preferences.overall_importance
                base_score = base_score * (1 - esg_weight) + esg_score * esg_weight * 5
            
            # Apply tax efficiency
            if tax_preferences and tax_preferences.prefer_tax_efficient:
                tax_efficiency = await self._calculate_tax_efficiency(weights, tax_preferences)
                base_score *= tax_efficiency
            
            # Apply sector constraints penalty
            if sector_preferences:
                sector_penalty = self._calculate_sector_penalty(weights, sector_preferences)
                base_score *= (1 - sector_penalty)
            
            # Apply stability preference
            if current_allocation:
                current_weights = current_allocation.to_numpy()
                deviation = np.sum(np.abs(weights - current_weights))
                if deviation > 0.3:
                    base_score *= (1 - (deviation - 0.3) * 0.5)
            
            return base_score
            
        except Exception:
            return -1e10
    
    async def _calculate_esg_score(self, weights: np.ndarray, esg_preferences: ESGPreferences) -> float:
        """Calculate ESG score for portfolio"""
        try:
            asset_data = await self.market_data.get_asset_data()
            asset_names = ["stocks", "bonds", "alternatives", "cash"]
            
            portfolio_esg = sum(
                weights[i] * asset_data[asset_names[i]]["esg_score"]
                for i in range(4)
            )
            
            # Adjust based on ESG component preferences
            esg_boost = esg_preferences.get_composite_score()
            return portfolio_esg * (0.5 + 0.5 * esg_boost)
            
        except Exception:
            return 0.6
    
    async def _calculate_tax_efficiency(self, weights: np.ndarray, tax_preferences: TaxPreferences) -> float:
        """Calculate tax efficiency for portfolio"""
        try:
            asset_data = await self.market_data.get_asset_data()
            asset_names = ["stocks", "bonds", "alternatives", "cash"]
            
            total_tax_efficiency = 0
            
            for i, asset_name in enumerate(asset_names):
                tax_efficiency = asset_data[asset_name]["tax_efficiency"]
                
                # Adjust for account type
                if tax_preferences.account_type in ["ira", "401k", "roth"]:
                    tax_efficiency = 1.0
                else:
                    tax_multiplier = tax_preferences.get_tax_efficiency_multiplier()
                    tax_efficiency = tax_efficiency * tax_multiplier
                
                total_tax_efficiency += weights[i] * tax_efficiency
            
            return total_tax_efficiency
            
        except Exception:
            return 1.0
    
    def _calculate_sector_penalty(self, weights: np.ndarray, sector_preferences: SectorPreferences) -> float:
        """Calculate penalty for sector constraint violations"""
        try:
            # Simplified sector penalty - penalize if single asset exceeds max concentration
            max_weight = np.max(weights)
            if max_weight > sector_preferences.max_sector_concentration:
                return (max_weight - sector_preferences.max_sector_concentration) * 0.5
            return 0.0
            
        except Exception:
            return 0.0
    
    def _get_risk_bounds(self, risk_tolerance: str) -> List[Tuple[float, float]]:
        """Get risk-adjusted allocation bounds"""
        if risk_tolerance == "low":
            return [(0, 0.5), (0.2, 0.8), (0, 0.2), (0, 0.3)]  # Conservative
        elif risk_tolerance == "medium":
            return [(0.1, 0.8), (0.1, 0.6), (0, 0.3), (0, 0.2)]  # Moderate
        else:  # high
            return [(0.3, 0.9), (0, 0.4), (0, 0.4), (0, 0.1)]   # Aggressive
    
    def _get_initial_guess(self, risk_tolerance: str) -> np.ndarray:
        """Get initial guess for optimization"""
        if risk_tolerance == "low":
            return np.array([0.3, 0.5, 0.1, 0.1])
        elif risk_tolerance == "medium":
            return np.array([0.6, 0.3, 0.1, 0.0])
        else:  # high
            return np.array([0.8, 0.1, 0.1, 0.0])
    
    def _validate_result(self, weights: np.ndarray) -> bool:
        """Validate optimization result"""
        return (
            len(weights) == 4 and
            np.all(weights >= -1e-6) and
            np.all(weights <= 1.001) and
            abs(np.sum(weights) - 1.0) < 0.01 and
            np.all(np.isfinite(weights))
        )
    
    def _get_fallback_allocation(self, risk_tolerance: str) -> PortfolioAllocation:
        """Get fallback allocation if optimization fails"""
        if risk_tolerance == "low":
            return PortfolioAllocation(stocks=0.25, bonds=0.60, alternatives=0.10, cash=0.05)
        elif risk_tolerance == "medium":
            return PortfolioAllocation(stocks=0.55, bonds=0.35, alternatives=0.10, cash=0.00)
        else:  # high
            return PortfolioAllocation(stocks=0.75, bonds=0.15, alternatives=0.10, cash=0.00)
    
    async def optimize_for_scenario(
        self,
        base_allocation: PortfolioAllocation,
        scenario_name: str,
        scenario_returns: Dict[str, float],
        risk_tolerance: str
    ) -> PortfolioAllocation:
        """
        Optimize portfolio for specific market scenario
        
        Args:
            base_allocation: Base portfolio allocation
            scenario_name: Name of the scenario
            scenario_returns: Expected returns under scenario
            risk_tolerance: Risk tolerance level
            
        Returns:
            PortfolioAllocation: Scenario-optimized allocation
        """
        try:
            logger.info(f"📈 Optimizing for scenario: {scenario_name}")
            
            # Override market data with scenario returns
            scenario_data = await self.market_data.get_asset_data()
            asset_names = ["stocks", "bonds", "alternatives", "cash"]
            
            # Update returns with scenario values
            returns = np.array([scenario_returns.get(asset, scenario_data[asset]["return"]) 
                               for asset in asset_names])
            
            # Get volatilities and correlation matrix
            volatilities = np.array([scenario_data[asset]["volatility"] for asset in asset_names])
            correlation_matrix = await self.market_data.get_correlation_matrix()
            
            # Build covariance matrix
            cov_matrix = np.diag(volatilities) @ correlation_matrix @ np.diag(volatilities)
            
            # Optimize for maximum Sharpe ratio under scenario
            def objective(weights):
                portfolio_return = np.dot(weights, returns)
                portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
                portfolio_volatility = np.sqrt(max(portfolio_variance, 1e-8))
                
                if portfolio_volatility == 0:
                    return 1e10
                
                sharpe = (portfolio_return - self.risk_free_rate) / portfolio_volatility
                return -sharpe
            
            # Set up optimization
            bounds = self._get_risk_bounds(risk_tolerance)
            constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}]
            x0 = base_allocation.to_numpy()
            
            result = minimize(
                objective,
                x0,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints,
                options={'maxiter': 100}
            )
            
            if result.success and self._validate_result(result.x):
                weights = np.maximum(result.x, 0)
                weights = weights / np.sum(weights)
                return PortfolioAllocation.from_numpy(weights)
            
            return base_allocation
            
        except Exception as e:
            logger.error(f"❌ Scenario optimization failed: {str(e)}")
            return base_allocation