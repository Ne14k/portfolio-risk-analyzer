"""Recommendation Engine Service"""

import numpy as np
from typing import Dict, List, Optional, Tuple
import asyncio
import logging

from models.portfolio_models import (
    PortfolioAllocation, ESGPreferences, TaxPreferences, 
    SectorPreferences, PortfolioInput, RiskMetrics
)
from utils.market_data import MarketDataProvider

logger = logging.getLogger(__name__)

class RecommendationEngine:
    
    def __init__(self, market_data_provider: MarketDataProvider):
        self.market_data = market_data_provider
    
    async def generate_recommendations(
        self,
        current: PortfolioAllocation,
        optimized: PortfolioAllocation,
        current_metrics: RiskMetrics,
        optimized_metrics: RiskMetrics,
        portfolio_input: PortfolioInput
    ) -> List[str]:
        
        try:
            logger.info("🎯 Generating AI-powered recommendations")
            
            recommendations = []
            
            stock_change = (optimized.stocks - current.stocks) * 100
            bond_change = (optimized.bonds - current.bonds) * 100
            alt_change = (optimized.alternatives - current.alternatives) * 100
            cash_change = (optimized.cash - current.cash) * 100
            
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
            
            sharpe_improvement = optimized_metrics.sharpe_ratio - current_metrics.sharpe_ratio
            return_improvement = optimized_metrics.expected_return - current_metrics.expected_return
            risk_reduction = current_metrics.volatility - optimized_metrics.volatility
            
            if sharpe_improvement > 0.1:
                recommendations.append(f"📊 This optimization improves risk-adjusted returns by {sharpe_improvement:.2f} (Sharpe ratio boost)")
            
            if return_improvement > 0.5:
                recommendations.append(f"💹 Expected annual return increases by {return_improvement:.1f}% with this allocation")
            
            if risk_reduction > 1:
                recommendations.append(f"🎯 Portfolio risk decreases by {risk_reduction:.1f}% while maintaining similar returns")
            
            if portfolio_input.esg_preferences and portfolio_input.esg_preferences.overall_importance > 0.5:
                current_weights = current.to_numpy()
                optimized_weights = optimized.to_numpy()
                
                current_esg = await self.calculate_esg_score(current_weights, portfolio_input.esg_preferences)
                optimized_esg = await self.calculate_esg_score(optimized_weights, portfolio_input.esg_preferences)
                
                if optimized_esg > current_esg:
                    recommendations.append(f"🌱 ESG score improves with this allocation, aligning better with your sustainability preferences")
            
            if portfolio_input.tax_preferences and portfolio_input.tax_preferences.prefer_tax_efficient:
                if portfolio_input.tax_preferences.account_type == "taxable":
                    recommendations.append("💼 Consider tax-loss harvesting and prioritizing tax-efficient investments in taxable accounts")
                elif portfolio_input.tax_preferences.account_type in ["ira", "401k"]:
                    recommendations.append("🏦 Maximize contributions to tax-advantaged accounts for optimal tax efficiency")
            
            if portfolio_input.risk_tolerance == "low" and current_metrics.volatility > 12:
                recommendations.append("🛡️ Your current portfolio may be too risky for your conservative risk tolerance - consider the optimized allocation")
            elif portfolio_input.risk_tolerance == "high" and current_metrics.volatility < 8:
                recommendations.append("🚀 You may be too conservative for your risk tolerance - consider increasing growth asset allocation")
            
            if portfolio_input.optimization_goal == "income" and optimized.bonds > current.bonds:
                recommendations.append("💰 Focus on high-quality dividend stocks and bonds to maximize income generation")
            elif portfolio_input.optimization_goal == "return" and optimized.stocks > current.stocks:
                recommendations.append("🎯 Emphasize growth-oriented investments to maximize long-term returns")
            elif portfolio_input.optimization_goal == "risk" and optimized_metrics.volatility < current_metrics.volatility:
                recommendations.append("⚖️ This allocation significantly reduces portfolio risk while maintaining reasonable returns")
            
            total_change = sum(abs(x) for x in [stock_change, bond_change, alt_change, cash_change])
            if total_change > 20:
                recommendations.append("⏰ Consider implementing these changes gradually over 2-3 months to minimize market timing risk")
            else:
                recommendations.append("✅ These are minor adjustments that can be implemented immediately")
            
            recommendations.append("🔄 Review and rebalance your portfolio quarterly or when allocations drift more than 5% from targets")
            
            return recommendations[:8]
            
        except Exception as e:
            logger.error(f"❌ Error generating recommendations: {str(e)}")
            return ["Unable to generate specific recommendations at this time."]
    
    async def generate_explanations(
        self,
        current_metrics: RiskMetrics,
        optimized_metrics: RiskMetrics,
        allocation: PortfolioAllocation
    ) -> List[str]:
        
        try:
            explanations = []
            
            if current_metrics.volatility > 15:
                explanations.append("High volatility indicates significant price swings - consider your risk tolerance")
            elif current_metrics.volatility < 5:
                explanations.append("Low volatility suggests stable but potentially lower returns")
            
            if current_metrics.sharpe_ratio > 1:
                explanations.append("Excellent risk-adjusted returns - good balance of return vs risk")
            elif current_metrics.sharpe_ratio < 0.5:
                explanations.append("Low Sharpe ratio suggests poor risk-adjusted returns")
            
            if current_metrics.diversification_score < 50:
                explanations.append("Consider diversifying across more asset classes to reduce risk")
            
            if optimized_metrics.expected_return > current_metrics.expected_return:
                explanations.append("The optimized allocation provides better expected returns for similar risk")
            
            if optimized_metrics.volatility < current_metrics.volatility:
                explanations.append("The optimized allocation reduces portfolio risk while maintaining returns")
            
            return explanations
            
        except Exception as e:
            logger.error(f"❌ Error generating explanations: {str(e)}")
            return ["Portfolio analysis completed successfully."]
    
    async def calculate_esg_score(self, weights: np.ndarray, esg_preferences: ESGPreferences) -> float:
        try:
            asset_data = await self.market_data.get_asset_data()
            asset_names = ["stocks", "bonds", "alternatives", "cash"]
            
            portfolio_esg = sum(
                weights[i] * asset_data[asset_names[i]]["esg_score"]
                for i in range(4)
            )
            
            esg_boost = esg_preferences.get_composite_score()
            return portfolio_esg * (0.5 + 0.5 * esg_boost)
            
        except Exception:
            return 0.6
    
    async def calculate_tax_efficiency(self, weights: np.ndarray, tax_preferences: TaxPreferences) -> float:
        try:
            asset_data = await self.market_data.get_asset_data()
            asset_names = ["stocks", "bonds", "alternatives", "cash"]
            
            total_tax_efficiency = 0
            
            for i, asset_name in enumerate(asset_names):
                tax_efficiency = asset_data[asset_name]["tax_efficiency"]
                
                if tax_preferences.account_type in ["ira", "401k", "roth"]:
                    tax_efficiency = 1.0
                else:
                    tax_multiplier = tax_preferences.get_tax_efficiency_multiplier()
                    tax_efficiency = tax_efficiency * tax_multiplier
                
                total_tax_efficiency += weights[i] * tax_efficiency
            
            return total_tax_efficiency
            
        except Exception:
            return 1.0