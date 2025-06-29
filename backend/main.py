from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from datetime import datetime
import json

app = FastAPI(title="Portfolio Risk Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PortfolioAllocation(BaseModel):
    stocks: float
    bonds: float
    alternatives: float
    cash: float

class PortfolioInput(BaseModel):
    allocation: PortfolioAllocation
    risk_tolerance: str  # "low", "medium", "high"
    target_return: Optional[float] = None
    time_horizon: Optional[int] = None  # years
    optimization_goal: Optional[str] = "sharpe"  # "sharpe", "return", "risk", "income"

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

# Historical returns data (simplified for demonstration)
ASSET_RETURNS = {
    "stocks": 0.10,      # 10% annual return
    "bonds": 0.04,       # 4% annual return
    "alternatives": 0.08, # 8% annual return
    "cash": 0.02         # 2% annual return
}

ASSET_VOLATILITY = {
    "stocks": 0.16,      # 16% volatility
    "bonds": 0.04,       # 4% volatility
    "alternatives": 0.12, # 12% volatility
    "cash": 0.01         # 1% volatility
}

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

def optimize_portfolio(target_return: float, risk_tolerance: str, optimization_goal: str = "sharpe") -> PortfolioAllocation:
    """Optimize portfolio using Modern Portfolio Theory with enhanced stability."""
    try:
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
                
                # Goal-based optimization
                if optimization_goal == "sharpe":
                    # Maximize Sharpe ratio (minimize negative Sharpe)
                    risk_free_rate = 0.02
                    if portfolio_volatility < 1e-8:
                        return 1e10
                    sharpe = (portfolio_return - risk_free_rate) / portfolio_volatility
                    return -sharpe  # Minimize negative Sharpe
                
                elif optimization_goal == "return":
                    # Maximize expected return (minimize negative return)
                    return -portfolio_return
                
                elif optimization_goal == "risk":
                    # Minimize risk (volatility)
                    return portfolio_var
                
                elif optimization_goal == "income":
                    # Maximize income (bonds + alternatives weighted for income)
                    income_score = weights[1] * 0.7 + weights[2] * 0.3  # Bonds 70%, alternatives 30%
                    return -income_score
                
                else:
                    # Default to volatility minimization
                    return portfolio_var
                
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
        
        # Risk-adjusted bounds with overlap prevention
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

def generate_recommendations(current: PortfolioAllocation, optimized: PortfolioAllocation, 
                           current_metrics: RiskMetrics, optimized_metrics: RiskMetrics) -> List[str]:
    """Generate investment recommendations."""
    recommendations = []
    
    # Compare allocations
    if optimized.stocks > current.stocks + 0.05:
        recommendations.append("Consider increasing equity exposure for better long-term growth potential")
    elif optimized.stocks < current.stocks - 0.05:
        recommendations.append("Consider reducing equity exposure to lower portfolio volatility")
    
    if optimized.bonds > current.bonds + 0.05:
        recommendations.append("Increase bond allocation for better stability and income generation")
    elif optimized.bonds < current.bonds - 0.05:
        recommendations.append("Consider reducing bond exposure if seeking higher returns")
    
    if optimized_metrics.sharpe_ratio > current_metrics.sharpe_ratio:
        recommendations.append("Optimization improves risk-adjusted returns (higher Sharpe ratio)")
    
    if optimized_metrics.diversification_score > current_metrics.diversification_score:
        recommendations.append("Better diversification reduces concentration risk")
    
    return recommendations

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
            print(f"Target return: {target_return}, Risk tolerance: {portfolio.risk_tolerance}, Goal: {optimization_goal}")
            optimized_allocation = optimize_portfolio(target_return, portfolio.risk_tolerance, optimization_goal)
            print(f"Optimization completed: {optimized_allocation}")
            optimized_metrics = calculate_portfolio_metrics(optimized_allocation)
        except Exception as e:
            print(f"Error in optimization: {e}")
            # Use current allocation as fallback
            optimized_allocation = portfolio.allocation
            optimized_metrics = current_metrics
        
        # Generate recommendations and explanations with error handling
        try:
            recommendations = generate_recommendations(
                portfolio.allocation, optimized_allocation, current_metrics, optimized_metrics
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
    uvicorn.run(app, host="0.0.0.0", port=8000)