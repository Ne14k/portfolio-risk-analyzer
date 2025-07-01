from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Literal
import numpy as np
import pandas as pd
from scipy.optimize import minimize, differential_evolution
from datetime import datetime
import json
import random
from itertools import product

app = FastAPI(title="Portfolio Risk Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now to debug
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

class PortfolioAllocation(BaseModel):
    stocks: float
    bonds: float
    alternatives: float
    cash: float

class ESGPreferences(BaseModel):
    environmental: float = 0.5  # 0-1 scale
    social: float = 0.5        # 0-1 scale
    governance: float = 0.5    # 0-1 scale
    overall_importance: float = 0.5  # How much ESG matters vs returns

class TaxPreferences(BaseModel):
    tax_bracket: float = 0.25  # Tax bracket percentage
    prefer_tax_efficient: bool = True
    account_type: Literal["taxable", "ira", "401k", "roth"] = "taxable"

class SectorPreferences(BaseModel):
    technology: Optional[float] = None  # Desired allocation (0-1)
    healthcare: Optional[float] = None
    financials: Optional[float] = None
    energy: Optional[float] = None
    max_sector_concentration: float = 0.3  # Max allocation to any sector

class PortfolioInput(BaseModel):
    allocation: PortfolioAllocation
    risk_tolerance: str  # "low", "medium", "high"
    target_return: Optional[float] = None
    time_horizon: Optional[int] = None  # years
    optimization_goal: Optional[str] = "sharpe"  # "sharpe", "return", "risk", "income"
    esg_preferences: Optional[ESGPreferences] = None
    tax_preferences: Optional[TaxPreferences] = None
    sector_preferences: Optional[SectorPreferences] = None
    use_ai_optimization: bool = True

class RiskMetrics(BaseModel):
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    diversification_score: float
    expected_return: float

class OptimizationResult(BaseModel):
    optimized_allocation: PortfolioAllocation
    current_metrics: RiskMetrics
    optimized_metrics: RiskMetrics
    recommendations: List[str]
    explanations: List[str]

# Enhanced asset data with ESG scores and sector information
ASSET_DATA = {
    "stocks": {
        "return": 0.10,
        "volatility": 0.16,
        "esg_score": 0.65,  # ESG score 0-1
        "tax_efficiency": 0.7,  # After-tax return efficiency
        "liquidity": 0.95,
        "sector_exposure": {
            "technology": 0.3,
            "healthcare": 0.15,
            "financials": 0.15,
            "energy": 0.1,
            "other": 0.3
        }
    },
    "bonds": {
        "return": 0.04,
        "volatility": 0.04,
        "esg_score": 0.55,
        "tax_efficiency": 0.6,  # Interest taxed as ordinary income
        "liquidity": 0.85,
        "sector_exposure": {
            "government": 0.6,
            "corporate": 0.4
        }
    },
    "alternatives": {
        "return": 0.08,
        "volatility": 0.12,
        "esg_score": 0.45,  # Lower ESG scores typically
        "tax_efficiency": 0.8,  # Can include tax-advantaged structures
        "liquidity": 0.6,
        "sector_exposure": {
            "real_estate": 0.5,
            "commodities": 0.3,
            "private_equity": 0.2
        }
    },
    "cash": {
        "return": 0.02,
        "volatility": 0.01,
        "esg_score": 0.9,  # Very high ESG
        "tax_efficiency": 0.5,  # Interest fully taxable
        "liquidity": 1.0,
        "sector_exposure": {}
    }
}

# Legacy compatibility
ASSET_RETURNS = {k: v["return"] for k, v in ASSET_DATA.items()}
ASSET_VOLATILITY = {k: v["volatility"] for k, v in ASSET_DATA.items()}

# Correlation matrix (simplified)
CORRELATION_MATRIX = np.array([
    [1.0, 0.2, 0.6, 0.1],   # stocks
    [0.2, 1.0, 0.3, 0.0],   # bonds
    [0.6, 0.3, 1.0, 0.1],   # alternatives
    [0.1, 0.0, 0.1, 1.0]    # cash
])

def calculate_portfolio_metrics(allocation: PortfolioAllocation) -> RiskMetrics:
    """Calculate portfolio risk metrics with robust error handling."""
    try:
        weights = np.array([allocation.stocks, allocation.bonds, allocation.alternatives, allocation.cash])
        
        # Validate weights
        if np.any(weights < 0):
            raise ValueError("Portfolio weights cannot be negative")
        if np.any(weights > 1):
            raise ValueError("Portfolio weights cannot exceed 100%")
        if abs(np.sum(weights) - 1.0) > 0.01:
            # Normalize weights if close to 1
            weights = weights / np.sum(weights)
        
        returns = np.array(list(ASSET_RETURNS.values()))
        volatilities = np.array(list(ASSET_VOLATILITY.values()))
        
        # Portfolio expected return with bounds checking
        portfolio_return = np.dot(weights, returns)
        if not np.isfinite(portfolio_return):
            portfolio_return = 0.05  # Default 5% return
        
        # Portfolio volatility with numerical stability
        try:
            cov_matrix = np.diag(volatilities) @ CORRELATION_MATRIX @ np.diag(volatilities)
            portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
            
            # Handle negative variance due to numerical errors
            if portfolio_variance < 0:
                portfolio_variance = abs(portfolio_variance)
            
            portfolio_volatility = np.sqrt(portfolio_variance)
            
            # Ensure minimum volatility to prevent division by zero
            if portfolio_volatility < 1e-8:
                portfolio_volatility = 1e-8
                
        except (np.linalg.LinAlgError, ValueError) as e:
            print(f"Matrix calculation error: {e}")
            # Fallback: weighted average of individual volatilities
            portfolio_volatility = np.dot(weights, volatilities)
        
        # Sharpe ratio with protection against division by zero
        risk_free_rate = 0.02
        try:
            sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility
            if not np.isfinite(sharpe_ratio):
                sharpe_ratio = 0.0
        except (ZeroDivisionError, ValueError):
            sharpe_ratio = 0.0
        
        # Diversification score with bounds checking
        try:
            herfindahl_index = np.sum(weights ** 2)
            diversification_score = max(0, min(100, (1 - herfindahl_index) * 100))
        except ValueError:
            diversification_score = 50.0  # Default moderate diversification
        
        # Max drawdown with reasonable bounds
        max_drawdown = min(portfolio_volatility * 2.5, 0.5)  # Cap at 50%
        
        return RiskMetrics(
            volatility=round(max(0, portfolio_volatility * 100), 2),
            sharpe_ratio=round(sharpe_ratio, 3),
            max_drawdown=round(max_drawdown * 100, 2),
            diversification_score=round(diversification_score, 1),
            expected_return=round(portfolio_return * 100, 2)
        )
        
    except Exception as e:
        print(f"Error in calculate_portfolio_metrics: {e}")
        # Return safe default metrics
        return RiskMetrics(
            volatility=10.0,
            sharpe_ratio=0.5,
            max_drawdown=15.0,
            diversification_score=50.0,
            expected_return=7.0
        )

def calculate_esg_score(weights: np.ndarray, esg_preferences: ESGPreferences = None) -> float:
    """Calculate portfolio ESG score based on weights and preferences."""
    if esg_preferences is None:
        return 0.6  # Default neutral ESG score
    
    asset_names = ["stocks", "bonds", "alternatives", "cash"]
    portfolio_esg = sum(weights[i] * ASSET_DATA[asset_names[i]]["esg_score"] for i in range(4))
    
    # Adjust based on ESG component preferences (simplified)
    esg_boost = (esg_preferences.environmental + esg_preferences.social + esg_preferences.governance) / 3
    return portfolio_esg * (0.5 + 0.5 * esg_boost)

def calculate_tax_efficiency(weights: np.ndarray, tax_preferences: TaxPreferences = None) -> float:
    """Calculate after-tax returns based on tax preferences."""
    if tax_preferences is None:
        return 1.0  # No tax adjustment
    
    asset_names = ["stocks", "bonds", "alternatives", "cash"]
    total_tax_efficiency = 0
    
    for i, asset_name in enumerate(asset_names):
        asset_return = ASSET_DATA[asset_name]["return"]
        tax_efficiency = ASSET_DATA[asset_name]["tax_efficiency"]
        
        # Adjust for account type
        if tax_preferences.account_type in ["ira", "401k", "roth"]:
            tax_efficiency = 1.0  # Tax-advantaged accounts
        else:
            # Apply tax bracket to determine after-tax efficiency
            tax_rate = tax_preferences.tax_bracket if tax_preferences.prefer_tax_efficient else tax_preferences.tax_bracket * 0.5
            tax_efficiency = tax_efficiency * (1 - tax_rate)
        
        total_tax_efficiency += weights[i] * tax_efficiency
    
    return total_tax_efficiency

def ai_monte_carlo_optimization(
    risk_tolerance: str,
    target_return: float,
    optimization_goal: str,
    esg_preferences: ESGPreferences = None,
    tax_preferences: TaxPreferences = None,
    sector_preferences: SectorPreferences = None,
    current_allocation: PortfolioAllocation = None,
    num_simulations: int = 10000
) -> PortfolioAllocation:
    """AI-powered Monte Carlo optimization simulating thousands of portfolio combinations."""
    
    print(f"Starting AI Monte Carlo optimization with {num_simulations} simulations...")
    
    best_portfolio = None
    best_score = float('-inf')
    
    # Set bounds based on risk tolerance and constraints
    if risk_tolerance == "low":
        bounds = [(0, 0.5), (0.2, 0.8), (0, 0.2), (0, 0.3)]  # Conservative
    elif risk_tolerance == "medium":
        bounds = [(0.1, 0.8), (0.1, 0.6), (0, 0.3), (0, 0.2)]  # Moderate
    else:  # high
        bounds = [(0.3, 0.9), (0, 0.4), (0, 0.4), (0, 0.1)]   # Aggressive
    
    asset_names = ["stocks", "bonds", "alternatives", "cash"]
    returns = np.array([ASSET_DATA[name]["return"] for name in asset_names])
    volatilities = np.array([ASSET_DATA[name]["volatility"] for name in asset_names])
    
    try:
        cov_matrix = np.diag(volatilities) @ CORRELATION_MATRIX @ np.diag(volatilities)
        cov_matrix += np.eye(len(cov_matrix)) * 1e-8  # Numerical stability
    except:
        cov_matrix = np.diag(volatilities ** 2)
    
    for simulation in range(num_simulations):
        try:
            # Generate random portfolio within bounds
            weights = np.array([
                random.uniform(bounds[i][0], bounds[i][1]) for i in range(4)
            ])
            
            # Normalize to sum to 1
            weights = weights / np.sum(weights)
            
            # Skip invalid portfolios
            if not all(bounds[i][0] <= weights[i] <= bounds[i][1] for i in range(4)):
                continue
            
            # Calculate base metrics
            portfolio_return = np.dot(weights, returns)
            portfolio_var = np.dot(weights, np.dot(cov_matrix, weights))
            portfolio_volatility = np.sqrt(max(portfolio_var, 1e-8))
            
            # Calculate composite score based on optimization goal
            score = 0
            
            if optimization_goal == "sharpe":
                risk_free_rate = 0.02
                sharpe = (portfolio_return - risk_free_rate) / portfolio_volatility
                score = sharpe
            elif optimization_goal == "return":
                score = portfolio_return
            elif optimization_goal == "risk":
                score = -portfolio_volatility  # Minimize risk
            elif optimization_goal == "income":
                # Weight bonds and dividend-paying assets
                income_score = weights[1] * 0.7 + weights[0] * 0.3
                score = income_score
            
            # Apply ESG adjustment
            if esg_preferences and esg_preferences.overall_importance > 0:
                esg_score = calculate_esg_score(weights, esg_preferences)
                esg_weight = esg_preferences.overall_importance
                score = score * (1 - esg_weight) + esg_score * esg_weight * 5  # Scale ESG impact
            
            # Apply tax efficiency adjustment
            if tax_preferences and tax_preferences.prefer_tax_efficient:
                tax_efficiency = calculate_tax_efficiency(weights, tax_preferences)
                score *= tax_efficiency
            
            # Apply penalty for deviation from current allocation if provided
            if current_allocation:
                current_weights = np.array([
                    current_allocation.stocks, current_allocation.bonds,
                    current_allocation.alternatives, current_allocation.cash
                ])
                deviation = np.sum(np.abs(weights - current_weights))
                if deviation > 0.3:  # Penalty for large changes
                    score *= (1 - (deviation - 0.3) * 0.5)
            
            # Apply sector preferences penalty (simplified)
            if sector_preferences and sector_preferences.max_sector_concentration < 1.0:
                # Penalize if single asset class exceeds max concentration
                max_weight = np.max(weights)
                if max_weight > sector_preferences.max_sector_concentration:
                    score *= (1 - (max_weight - sector_preferences.max_sector_concentration))
            
            # Track best portfolio
            if score > best_score:
                best_score = score
                best_portfolio = weights.copy()
                
        except Exception as e:
            continue  # Skip problematic simulations
    
    if best_portfolio is not None:
        return PortfolioAllocation(
            stocks=round(float(best_portfolio[0]), 3),
            bonds=round(float(best_portfolio[1]), 3),
            alternatives=round(float(best_portfolio[2]), 3),
            cash=round(float(best_portfolio[3]), 3)
        )
    
    # Fallback to rule-based allocation
    print("AI optimization failed, using rule-based fallback")
    if risk_tolerance == "low":
        return PortfolioAllocation(stocks=0.25, bonds=0.60, alternatives=0.10, cash=0.05)
    elif risk_tolerance == "medium":
        return PortfolioAllocation(stocks=0.55, bonds=0.35, alternatives=0.10, cash=0.00)
    else:
        return PortfolioAllocation(stocks=0.75, bonds=0.15, alternatives=0.10, cash=0.00)

def ai_genetic_algorithm_optimization(
    risk_tolerance: str,
    target_return: float,
    optimization_goal: str,
    esg_preferences: ESGPreferences = None,
    tax_preferences: TaxPreferences = None,
    sector_preferences: SectorPreferences = None,
    current_allocation: PortfolioAllocation = None
) -> PortfolioAllocation:
    """Genetic algorithm for portfolio optimization using differential evolution."""
    
    asset_names = ["stocks", "bonds", "alternatives", "cash"]
    returns = np.array([ASSET_DATA[name]["return"] for name in asset_names])
    volatilities = np.array([ASSET_DATA[name]["volatility"] for name in asset_names])
    
    try:
        cov_matrix = np.diag(volatilities) @ CORRELATION_MATRIX @ np.diag(volatilities)
        cov_matrix += np.eye(len(cov_matrix)) * 1e-8
    except:
        cov_matrix = np.diag(volatilities ** 2)
    
    def fitness_function(weights):
        """Fitness function for genetic algorithm."""
        try:
            # Normalize weights
            weights = np.abs(weights)
            weights = weights / np.sum(weights)
            
            # Calculate base metrics
            portfolio_return = np.dot(weights, returns)
            portfolio_var = np.dot(weights, np.dot(cov_matrix, weights))
            portfolio_volatility = np.sqrt(max(portfolio_var, 1e-8))
            
            # Calculate fitness based on goal
            if optimization_goal == "sharpe":
                risk_free_rate = 0.02
                fitness = (portfolio_return - risk_free_rate) / portfolio_volatility
            elif optimization_goal == "return":
                fitness = portfolio_return
            elif optimization_goal == "risk":
                fitness = -portfolio_volatility
            elif optimization_goal == "income":
                fitness = weights[1] * 0.7 + weights[0] * 0.3
            else:
                fitness = (portfolio_return - 0.02) / portfolio_volatility
            
            # Apply ESG weighting
            if esg_preferences:
                esg_score = calculate_esg_score(weights, esg_preferences)
                esg_weight = esg_preferences.overall_importance
                fitness = fitness * (1 - esg_weight) + esg_score * esg_weight * 2
            
            # Apply tax efficiency
            if tax_preferences:
                tax_efficiency = calculate_tax_efficiency(weights, tax_preferences)
                fitness *= tax_efficiency
            
            return -fitness  # Minimize negative fitness
            
        except:
            return 1e10  # Penalty for invalid portfolios
    
    # Set bounds
    if risk_tolerance == "low":
        bounds = [(0, 0.5), (0.2, 0.8), (0, 0.2), (0, 0.3)]
    elif risk_tolerance == "medium":
        bounds = [(0.1, 0.8), (0.1, 0.6), (0, 0.3), (0, 0.2)]
    else:
        bounds = [(0.3, 0.9), (0, 0.4), (0, 0.4), (0, 0.1)]
    
    try:
        result = differential_evolution(
            fitness_function,
            bounds,
            maxiter=100,
            popsize=15,
            seed=42
        )
        
        if result.success:
            weights = np.abs(result.x)
            weights = weights / np.sum(weights)
            
            return PortfolioAllocation(
                stocks=round(float(weights[0]), 3),
                bonds=round(float(weights[1]), 3),
                alternatives=round(float(weights[2]), 3),
                cash=round(float(weights[3]), 3)
            )
    except Exception as e:
        print(f"Genetic algorithm failed: {e}")
    
    # Fallback
    return ai_monte_carlo_optimization(
        risk_tolerance, target_return, optimization_goal,
        esg_preferences, tax_preferences, sector_preferences, current_allocation, 1000
    )

def optimize_portfolio(
    target_return: float, 
    risk_tolerance: str, 
    optimization_goal: str = "sharpe", 
    current_allocation: PortfolioAllocation = None,
    esg_preferences: ESGPreferences = None,
    tax_preferences: TaxPreferences = None,
    sector_preferences: SectorPreferences = None,
    use_ai_optimization: bool = True
) -> PortfolioAllocation:
    """Optimize portfolio using AI-powered simulation or Modern Portfolio Theory."""
    try:
        # Use AI optimization if enabled
        if use_ai_optimization:
            try:
                print("Using AI-powered optimization...")
                
                # Try genetic algorithm first for complex constraints
                if esg_preferences or tax_preferences or sector_preferences:
                    ai_result = ai_genetic_algorithm_optimization(
                        risk_tolerance, target_return, optimization_goal,
                        esg_preferences, tax_preferences, sector_preferences, current_allocation
                    )
                else:
                    # Use Monte Carlo for simpler cases
                    ai_result = ai_monte_carlo_optimization(
                        risk_tolerance, target_return, optimization_goal,
                        esg_preferences, tax_preferences, sector_preferences, current_allocation
                    )
                
                if ai_result:
                    print(f"AI optimization successful: {ai_result}")
                    return ai_result
                    
            except Exception as e:
                print(f"AI optimization failed, falling back to traditional methods: {e}")
        
        # Validate inputs
        if not isinstance(target_return, (int, float)) or target_return < 0:
            target_return = 0.08  # Default 8% return
        if target_return > 0.5:  # Cap at 50% return
            target_return = 0.15
        
        returns = np.array(list(ASSET_RETURNS.values()))
        volatilities = np.array(list(ASSET_VOLATILITY.values()))
        
        # Build covariance matrix with numerical stability
        try:
            cov_matrix = np.diag(volatilities) @ CORRELATION_MATRIX @ np.diag(volatilities)
            # Add small diagonal element for numerical stability
            cov_matrix += np.eye(len(cov_matrix)) * 1e-8
            
            # Check if matrix is positive definite
            eigenvals = np.linalg.eigvals(cov_matrix)
            if np.any(eigenvals <= 0):
                print("Warning: Covariance matrix not positive definite, using regularization")
                cov_matrix += np.eye(len(cov_matrix)) * 1e-6
                
        except np.linalg.LinAlgError as e:
            print(f"Covariance matrix error: {e}")
            # Use simplified diagonal covariance matrix
            cov_matrix = np.diag(volatilities ** 2)
        
        # Get current allocation as array for distance calculations
        if current_allocation:
            current_weights = np.array([current_allocation.stocks, current_allocation.bonds, 
                                      current_allocation.alternatives, current_allocation.cash])
        else:
            current_weights = None
        
        # Objective function with enhanced error handling and goal-based optimization
        def objective(weights):
            try:
                # Validate weights
                if len(weights) != 4:
                    return 1e10
                if np.any(weights < 0) or np.any(weights > 1):
                    return 1e10
                if abs(np.sum(weights) - 1.0) > 0.1:
                    return 1e10
                
                # Calculate portfolio metrics
                portfolio_return = np.dot(weights, returns)
                portfolio_var = np.dot(weights, np.dot(cov_matrix, weights))
                portfolio_volatility = np.sqrt(portfolio_var)
                
                # Return penalty for invalid results
                if not np.isfinite(portfolio_var) or portfolio_var < 0:
                    return 1e10
                if not np.isfinite(portfolio_return):
                    return 1e10
                
                # Calculate base objective based on optimization goal
                base_objective = 0
                
                if optimization_goal == "sharpe":
                    # Maximize Sharpe ratio (minimize negative Sharpe)
                    risk_free_rate = 0.02
                    if portfolio_volatility < 1e-8:
                        return 1e10
                    sharpe = (portfolio_return - risk_free_rate) / portfolio_volatility
                    base_objective = -sharpe  # Minimize negative Sharpe
                
                elif optimization_goal == "return":
                    # Maximize expected return (minimize negative return)
                    base_objective = -portfolio_return
                
                elif optimization_goal == "risk":
                    # Minimize risk (volatility)
                    base_objective = portfolio_var
                
                elif optimization_goal == "income":
                    # Maximize income (bonds + alternatives weighted for income)
                    income_score = weights[1] * 0.7 + weights[2] * 0.3  # Bonds 70%, alternatives 30%
                    base_objective = -income_score
                
                else:
                    # Default to volatility minimization
                    base_objective = portfolio_var
                
                # Add penalty for large deviations from current allocation (if provided)
                if current_weights is not None:
                    # Calculate weighted distance from current allocation
                    allocation_distance = np.sum(np.abs(weights - current_weights))
                    
                    # Progressive penalty: small changes are fine, large changes are penalized more
                    if allocation_distance > 0.3:  # If total change > 30%
                        distance_penalty = (allocation_distance - 0.3) ** 2 * 2.0  # Quadratic penalty
                    elif allocation_distance > 0.15:  # If total change > 15%
                        distance_penalty = (allocation_distance - 0.15) * 0.5  # Linear penalty
                    else:
                        distance_penalty = 0  # No penalty for small changes
                    
                    # Scale the penalty based on objective magnitude to maintain balance
                    objective_scale = max(abs(base_objective), 0.1)
                    scaled_penalty = distance_penalty * objective_scale * 0.3
                    
                    return base_objective + scaled_penalty
                
                return base_objective
                
            except Exception as e:
                print(f"Objective function error: {e}")
                return 1e10
        
        # Conservative constraints for stability
        constraints = [
            {
                'type': 'eq', 
                'fun': lambda x: np.sum(x) - 1.0,
                'jac': lambda x: np.ones(4)
            }
        ]
        
        # Use current allocation as starting point if provided, otherwise use risk-based defaults
        if current_allocation:
            x0 = np.array([current_allocation.stocks, current_allocation.bonds, 
                          current_allocation.alternatives, current_allocation.cash])
            
            # Create personalized bounds based on current allocation with reasonable deviation limits
            max_change = 0.25  # Allow up to 25% change in any direction initially
            
            # Risk tolerance adjusts how much change is allowed
            if risk_tolerance == "low":
                max_change = 0.15  # More conservative changes
            elif risk_tolerance == "medium":
                max_change = 0.20  # Moderate changes
            else:  # high
                max_change = 0.30  # Allow larger changes for aggressive investors
            
            # Create bounds that respect both risk tolerance and current allocation
            bounds = []
            for i, current_weight in enumerate(x0):
                min_bound = max(0, current_weight - max_change)
                max_bound = min(1, current_weight + max_change)
                
                # Apply risk tolerance constraints
                if i == 0:  # stocks
                    if risk_tolerance == "low":
                        max_bound = min(max_bound, 0.5)
                    elif risk_tolerance == "medium":
                        min_bound = max(min_bound, 0.1)
                        max_bound = min(max_bound, 0.8)
                    else:  # high
                        min_bound = max(min_bound, 0.3)
                        max_bound = min(max_bound, 0.9)
                elif i == 1:  # bonds
                    if risk_tolerance == "low":
                        min_bound = max(min_bound, 0.2)
                    elif risk_tolerance == "high":
                        max_bound = min(max_bound, 0.4)
                elif i == 2:  # alternatives
                    max_bound = min(max_bound, 0.4)  # Cap alternatives at 40%
                elif i == 3:  # cash
                    max_bound = min(max_bound, 0.3)  # Cap cash at 30%
                
                bounds.append((min_bound, max_bound))
            
        else:
            # Risk-adjusted bounds with overlap prevention (fallback)
            if risk_tolerance == "low":
                bounds = [(0, 0.5), (0.2, 0.8), (0, 0.2), (0, 0.3)]  # Conservative
                x0 = np.array([0.3, 0.5, 0.1, 0.1])
            elif risk_tolerance == "medium":
                bounds = [(0.1, 0.8), (0.1, 0.6), (0, 0.3), (0, 0.2)]  # Moderate
                x0 = np.array([0.6, 0.3, 0.1, 0.0])
            else:  # high
                bounds = [(0.3, 0.9), (0, 0.4), (0, 0.4), (0, 0.1)]   # Aggressive
                x0 = np.array([0.8, 0.1, 0.1, 0.0])
        
        # Normalize initial guess
        x0 = x0 / np.sum(x0)
        
        # Multiple optimization attempts with different methods
        optimization_methods = ['SLSQP', 'trust-constr']
        
        for method in optimization_methods:
            try:
                result = minimize(
                    objective, 
                    x0, 
                    method=method, 
                    bounds=bounds, 
                    constraints=constraints,
                    options={
                        'maxiter': 200,
                        'ftol': 1e-9,
                        'disp': False
                    }
                )
                
                # Validate optimization result
                if (result.success and 
                    len(result.x) == 4 and
                    np.all(result.x >= -1e-6) and  # Allow small negative due to numerical errors
                    np.all(result.x <= 1.001) and  # Allow small overshoot
                    abs(np.sum(result.x) - 1.0) < 0.01):
                    
                    weights = np.maximum(result.x, 0)  # Ensure non-negative
                    weights = weights / np.sum(weights)  # Normalize
                    
                    # Final validation
                    if np.all(np.isfinite(weights)) and np.all(weights >= 0):
                        return PortfolioAllocation(
                            stocks=round(float(weights[0]), 3),
                            bonds=round(float(weights[1]), 3),
                            alternatives=round(float(weights[2]), 3),
                            cash=round(float(weights[3]), 3)
                        )
                        
                print(f"Optimization with {method} unsuccessful: {result.message if hasattr(result, 'message') else 'Unknown error'}")
                        
            except Exception as e:
                print(f"Optimization method {method} failed: {e}")
                continue
            
    except Exception as e:
        print(f"Portfolio optimization error: {e}")
        import traceback
        traceback.print_exc()
    
    # Enhanced fallback allocations
    print(f"Using fallback allocation for risk tolerance: {risk_tolerance}")
    if risk_tolerance == "low":
        return PortfolioAllocation(stocks=0.25, bonds=0.60, alternatives=0.10, cash=0.05)
    elif risk_tolerance == "medium":
        return PortfolioAllocation(stocks=0.55, bonds=0.35, alternatives=0.10, cash=0.00)
    else:
        return PortfolioAllocation(stocks=0.75, bonds=0.15, alternatives=0.10, cash=0.00)

def generate_ai_recommendations(
    current: PortfolioAllocation, 
    optimized: PortfolioAllocation, 
    current_metrics: RiskMetrics, 
    optimized_metrics: RiskMetrics,
    portfolio_input: PortfolioInput
) -> List[str]:
    """Generate actionable AI-driven investment recommendations."""
    recommendations = []
    
    # Calculate percentage changes for precision
    stock_change = (optimized.stocks - current.stocks) * 100
    bond_change = (optimized.bonds - current.bonds) * 100
    alt_change = (optimized.alternatives - current.alternatives) * 100
    cash_change = (optimized.cash - current.cash) * 100
    
    # Generate specific allocation recommendations
    if abs(stock_change) > 5:
        if stock_change > 0:
            recommendations.append(f"🎯 Increase stock allocation by {stock_change:.1f}% to {optimized.stocks*100:.1f}% for enhanced growth potential")
        else:
            recommendations.append(f"🛡️ Reduce stock allocation by {abs(stock_change):.1f}% to {optimized.stocks*100:.1f}% to lower portfolio risk")
    
    if abs(bond_change) > 5:
        if bond_change > 0:
            recommendations.append(f"⚖️ Increase bond allocation by {bond_change:.1f}% to {optimized.bonds*100:.1f}% for better stability and income")
        else:
            recommendations.append(f"📈 Reduce bond allocation by {abs(bond_change):.1f}% to {optimized.bonds*100:.1f}% to increase growth potential")
    
    if abs(alt_change) > 2:
        if alt_change > 0:
            recommendations.append(f"🏗️ Add {alt_change:.1f}% to alternatives for better diversification and inflation protection")
        else:
            recommendations.append(f"🔄 Reduce alternatives by {abs(alt_change):.1f}% to simplify portfolio and reduce complexity")
    
    if abs(cash_change) > 2:
        if cash_change > 0:
            recommendations.append(f"💰 Increase cash position by {cash_change:.1f}% for enhanced liquidity and opportunity fund")
        else:
            recommendations.append(f"⚡ Deploy {abs(cash_change):.1f}% of cash into growth assets to reduce cash drag")
    
    # Performance improvement recommendations
    sharpe_improvement = optimized_metrics.sharpe_ratio - current_metrics.sharpe_ratio
    return_improvement = optimized_metrics.expected_return - current_metrics.expected_return
    risk_reduction = current_metrics.volatility - optimized_metrics.volatility
    
    if sharpe_improvement > 0.1:
        recommendations.append(f"📊 This optimization improves risk-adjusted returns by {sharpe_improvement:.2f} (Sharpe ratio boost)")
    
    if return_improvement > 0.5:
        recommendations.append(f"💹 Expected annual return increases by {return_improvement:.1f}% with this allocation")
    
    if risk_reduction > 1:
        recommendations.append(f"🎯 Portfolio risk decreases by {risk_reduction:.1f}% while maintaining similar returns")
    
    # ESG-specific recommendations
    if portfolio_input.esg_preferences and portfolio_input.esg_preferences.overall_importance > 0.5:
        current_weights = np.array([current.stocks, current.bonds, current.alternatives, current.cash])
        optimized_weights = np.array([optimized.stocks, optimized.bonds, optimized.alternatives, optimized.cash])
        
        current_esg = calculate_esg_score(current_weights, portfolio_input.esg_preferences)
        optimized_esg = calculate_esg_score(optimized_weights, portfolio_input.esg_preferences)
        
        if optimized_esg > current_esg:
            recommendations.append(f"🌱 ESG score improves with this allocation, aligning better with your sustainability preferences")
    
    # Tax efficiency recommendations
    if portfolio_input.tax_preferences and portfolio_input.tax_preferences.prefer_tax_efficient:
        if portfolio_input.tax_preferences.account_type == "taxable":
            recommendations.append("💼 Consider tax-loss harvesting and prioritizing tax-efficient investments in taxable accounts")
        elif portfolio_input.tax_preferences.account_type in ["ira", "401k"]:
            recommendations.append("🏦 Maximize contributions to tax-advantaged accounts for optimal tax efficiency")
    
    # Risk tolerance alignment
    if portfolio_input.risk_tolerance == "low" and current_metrics.volatility > 12:
        recommendations.append("🛡️ Your current portfolio may be too risky for your conservative risk tolerance - consider the optimized allocation")
    elif portfolio_input.risk_tolerance == "high" and current_metrics.volatility < 8:
        recommendations.append("🚀 You may be too conservative for your risk tolerance - consider increasing growth asset allocation")
    
    # Specific action items based on optimization goal
    if portfolio_input.optimization_goal == "income" and optimized.bonds > current.bonds:
        recommendations.append("💰 Focus on high-quality dividend stocks and bonds to maximize income generation")
    elif portfolio_input.optimization_goal == "return" and optimized.stocks > current.stocks:
        recommendations.append("🎯 Emphasize growth-oriented investments to maximize long-term returns")
    elif portfolio_input.optimization_goal == "risk" and optimized_metrics.volatility < current_metrics.volatility:
        recommendations.append("⚖️ This allocation significantly reduces portfolio risk while maintaining reasonable returns")
    
    # Implementation timeline recommendations
    if sum(abs(x) for x in [stock_change, bond_change, alt_change, cash_change]) > 20:
        recommendations.append("⏰ Consider implementing these changes gradually over 2-3 months to minimize market timing risk")
    else:
        recommendations.append("✅ These are minor adjustments that can be implemented immediately")
    
    # Rebalancing frequency
    recommendations.append("🔄 Review and rebalance your portfolio quarterly or when allocations drift more than 5% from targets")
    
    return recommendations[:8]  # Limit to top 8 most relevant recommendations

def generate_explanations(metrics: RiskMetrics, allocation: PortfolioAllocation) -> List[str]:
    """Generate educational explanations."""
    explanations = []
    
    if metrics.volatility > 15:
        explanations.append("High volatility indicates significant price swings - consider your risk tolerance")
    elif metrics.volatility < 5:
        explanations.append("Low volatility suggests stable but potentially lower returns")
    
    if metrics.sharpe_ratio > 1:
        explanations.append("Excellent risk-adjusted returns - good balance of return vs risk")
    elif metrics.sharpe_ratio < 0.5:
        explanations.append("Low Sharpe ratio suggests poor risk-adjusted returns")
    
    if metrics.diversification_score < 50:
        explanations.append("Consider diversifying across more asset classes to reduce risk")
    
    return explanations

@app.get("/")
async def root():
    return {"message": "Portfolio Risk Analyzer API"}

@app.post("/analyze", response_model=OptimizationResult)
async def analyze_portfolio(portfolio: PortfolioInput):
    """Analyze portfolio and provide optimization recommendations."""
    try:
        print(f"Received portfolio analysis request: {portfolio}")
        
        # Validate allocation sums to 1
        total = portfolio.allocation.stocks + portfolio.allocation.bonds + portfolio.allocation.alternatives + portfolio.allocation.cash
        if abs(total - 1.0) > 0.01:
            raise HTTPException(status_code=400, detail="Portfolio allocation must sum to 1.0")
        
        # Calculate current metrics with error handling
        try:
            current_metrics = calculate_portfolio_metrics(portfolio.allocation)
            print(f"Current metrics calculated successfully: {current_metrics}")
        except Exception as e:
            print(f"Error calculating current metrics: {e}")
            raise HTTPException(status_code=500, detail=f"Error calculating portfolio metrics: {str(e)}")
        
        # Optimize portfolio with error handling
        try:
            target_return = portfolio.target_return or current_metrics.expected_return / 100
            optimization_goal = portfolio.optimization_goal or "sharpe"
            use_ai = portfolio.use_ai_optimization if hasattr(portfolio, 'use_ai_optimization') else True
            
            print(f"Target return: {target_return}, Risk tolerance: {portfolio.risk_tolerance}, Goal: {optimization_goal}, AI: {use_ai}")
            
            optimized_allocation = optimize_portfolio(
                target_return, 
                portfolio.risk_tolerance, 
                optimization_goal, 
                portfolio.allocation,
                portfolio.esg_preferences,
                portfolio.tax_preferences,
                portfolio.sector_preferences,
                use_ai
            )
            print(f"Optimization completed: {optimized_allocation}")
            optimized_metrics = calculate_portfolio_metrics(optimized_allocation)
        except Exception as e:
            print(f"Error in optimization: {e}")
            # Use current allocation as fallback
            optimized_allocation = portfolio.allocation
            optimized_metrics = current_metrics
        
        # Generate recommendations and explanations with error handling
        try:
            recommendations = generate_ai_recommendations(
                portfolio.allocation, optimized_allocation, current_metrics, optimized_metrics, portfolio
            )
            explanations = generate_explanations(current_metrics, portfolio.allocation)
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            recommendations = ["Unable to generate specific recommendations at this time."]
            explanations = ["Portfolio analysis completed successfully."]
        
        result = OptimizationResult(
            optimized_allocation=optimized_allocation,
            current_metrics=current_metrics,
            optimized_metrics=optimized_metrics,
            recommendations=recommendations,
            explanations=explanations
        )
        print(f"Analysis completed successfully")
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in analyze_portfolio: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/asset-classes")
async def get_asset_classes():
    """Get available asset classes with their characteristics."""
    return {
        "asset_classes": [
            {
                "name": "stocks",
                "display_name": "Stocks",
                "expected_return": ASSET_RETURNS["stocks"] * 100,
                "volatility": ASSET_VOLATILITY["stocks"] * 100,
                "description": "Equity investments for long-term growth"
            },
            {
                "name": "bonds",
                "display_name": "Bonds", 
                "expected_return": ASSET_RETURNS["bonds"] * 100,
                "volatility": ASSET_VOLATILITY["bonds"] * 100,
                "description": "Fixed income for stability and income"
            },
            {
                "name": "alternatives",
                "display_name": "Alternatives",
                "expected_return": ASSET_RETURNS["alternatives"] * 100,
                "volatility": ASSET_VOLATILITY["alternatives"] * 100,
                "description": "REITs, commodities, and other alternatives"
            },
            {
                "name": "cash",
                "display_name": "Cash",
                "expected_return": ASSET_RETURNS["cash"] * 100,
                "volatility": ASSET_VOLATILITY["cash"] * 100,
                "description": "Cash and short-term instruments for liquidity"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)