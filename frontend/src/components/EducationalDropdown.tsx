import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, TrendingUp, Shield, Target, DollarSign } from 'lucide-react';
import { PortfolioAllocation, OptimizationResult } from '../types';

interface EducationalDropdownProps {
  allocation: PortfolioAllocation;
  result: OptimizationResult;
  riskTolerance: 'low' | 'medium' | 'high';
  optimizationGoal: 'sharpe' | 'risk' | 'return' | 'income';
  targetReturn: number;
}

interface EducationalInsight {
  title: string;
  icon: React.ComponentType<any>;
  content: string;
  category: 'portfolio' | 'risk' | 'optimization' | 'strategy';
}

const generateEducationalInsights = (
  allocation: PortfolioAllocation,
  result: OptimizationResult,
  riskTolerance: 'low' | 'medium' | 'high',
  optimizationGoal: 'sharpe' | 'risk' | 'return' | 'income',
  targetReturn: number
): EducationalInsight[] => {
  const insights: EducationalInsight[] = [];
  
  // Portfolio Composition Analysis
  const stockWeight = allocation.stocks * 100;
  const bondWeight = allocation.bonds * 100;
  const altWeight = allocation.alternatives * 100;
  const cashWeight = allocation.cash * 100;
  
  // Portfolio Balance Insight
  if (stockWeight > 70) {
    insights.push({
      title: "Equity-Heavy Portfolio Analysis",
      icon: TrendingUp,
      content: `Your portfolio is heavily weighted towards stocks (${stockWeight.toFixed(1)}%). This aggressive allocation can provide strong long-term growth potential, typically averaging 8-12% annually over decades. However, you should expect significant volatility - drops of 20-40% during market downturns are normal. This strategy works best if you have a long investment timeline (10+ years) and can stomach short-term fluctuations. Consider your age, financial goals, and emotional tolerance for seeing your portfolio value swing dramatically.`,
      category: 'portfolio'
    });
  } else if (stockWeight < 30) {
    insights.push({
      title: "Conservative Portfolio Approach",
      icon: Shield,
      content: `Your conservative stock allocation (${stockWeight.toFixed(1)}%) prioritizes capital preservation over growth. With ${bondWeight.toFixed(1)}% in bonds and ${cashWeight.toFixed(1)}% in cash, you're likely to experience lower volatility but also lower long-term returns (typically 4-7% annually). This approach is suitable if you're nearing retirement, have a short investment timeline, or prioritize stability over growth. However, inflation can erode purchasing power over time with overly conservative allocations.`,
      category: 'portfolio'
    });
  } else {
    insights.push({
      title: "Balanced Portfolio Strategy",
      icon: Target,
      content: `Your balanced allocation (${stockWeight.toFixed(1)}% stocks, ${bondWeight.toFixed(1)}% bonds) follows a moderate approach that balances growth potential with stability. This classic strategy typically provides 6-9% annual returns with moderate volatility. The bond portion helps cushion during stock market declines, while stocks provide long-term growth. This allocation suits investors with medium-term goals (5-15 years) who want steady progress without extreme volatility.`,
      category: 'portfolio'
    });
  }
  
  // Risk Analysis Based on Metrics
  const sharpeRatio = result.current_metrics.sharpe_ratio;
  const volatility = result.current_metrics.volatility;
  
  if (sharpeRatio > 1.5) {
    insights.push({
      title: "Excellent Risk-Adjusted Returns",
      icon: TrendingUp,
      content: `Your portfolio's Sharpe ratio of ${sharpeRatio.toFixed(2)} indicates excellent risk-adjusted performance. This means you're earning strong returns relative to the risk taken. A Sharpe ratio above 1.5 is considered very good, suggesting efficient use of risk in your portfolio. This typically occurs when you have good diversification and your risk level aligns well with your return expectations. Maintain this balance while monitoring for any major allocation drifts.`,
      category: 'risk'
    });
  } else if (sharpeRatio < 0.5) {
    insights.push({
      title: "Risk-Return Efficiency Concerns",
      icon: Shield,
      content: `Your Sharpe ratio of ${sharpeRatio.toFixed(2)} suggests your portfolio may not be efficiently using risk to generate returns. This could indicate over-concentration in certain assets, poor diversification, or a mismatch between your risk tolerance and allocation. Consider the optimization suggestions to improve risk-adjusted returns. Sometimes, taking slightly more risk in the right areas can actually improve your risk-adjusted performance through better diversification.`,
      category: 'risk'
    });
  }
  
  // Volatility Insight
  if (volatility > 20) {
    insights.push({
      title: "High Volatility Considerations",
      icon: TrendingUp,
      content: `Your portfolio volatility of ${volatility.toFixed(1)}% means you should expect your portfolio value to fluctuate significantly - roughly two-thirds of the time, annual returns will fall within +/- ${volatility.toFixed(1)}% of your expected return. In practical terms, a $100,000 portfolio might swing by $${(volatility * 1000).toFixed(0)} or more in a typical year. Ensure you're comfortable with this level of fluctuation and have sufficient emergency funds so you won't need to sell during downturns.`,
      category: 'risk'
    });
  }
  
  // Optimization Goal Insights
  if (optimizationGoal === 'sharpe') {
    insights.push({
      title: "Sharpe Ratio Optimization Strategy",
      icon: Target,
      content: `By optimizing for Sharpe ratio, you're seeking the best risk-adjusted returns - the most "bang for your buck" in terms of risk taken. This approach typically leads to well-diversified portfolios that balance multiple asset classes efficiently. The optimization suggests moving to ${(result.optimized_allocation.stocks * 100).toFixed(1)}% stocks and ${(result.optimized_allocation.bonds * 100).toFixed(1)}% bonds. This isn't about maximizing returns at any cost, but finding the sweet spot where each unit of risk taken generates the most return.`,
      category: 'optimization'
    });
  } else if (optimizationGoal === 'return') {
    insights.push({
      title: "Return Maximization Approach",
      icon: TrendingUp,
      content: `Your focus on maximizing returns typically leads to higher stock allocations, as equities historically provide the highest long-term returns. The optimization suggests ${(result.optimized_allocation.stocks * 100).toFixed(1)}% in stocks to achieve your ${targetReturn}% target return. Remember that pursuing maximum returns comes with maximum volatility - be prepared for significant short-term fluctuations. This strategy works best with long time horizons and strong emotional discipline during market downturns.`,
      category: 'optimization'
    });
  } else if (optimizationGoal === 'risk') {
    insights.push({
      title: "Risk Minimization Strategy",
      icon: Shield,
      content: `By prioritizing risk reduction, you're focusing on capital preservation and stability. The optimization suggests ${(result.optimized_allocation.bonds * 100).toFixed(1)}% in bonds and ${(result.optimized_allocation.cash * 100).toFixed(1)}% in cash to minimize volatility. While this reduces the chance of large losses, it also limits growth potential. This approach suits investors nearing major financial goals, those uncomfortable with volatility, or those in uncertain economic times who prioritize preserving capital.`,
      category: 'optimization'
    });
  } else if (optimizationGoal === 'income') {
    insights.push({
      title: "Income Generation Focus",
      icon: DollarSign,
      content: `Your income-focused strategy emphasizes assets that pay regular dividends and interest. The optimization suggests ${(result.optimized_allocation.bonds * 100).toFixed(1)}% in bonds for steady interest payments and dividend-paying stocks. This approach provides more predictable cash flows, which is valuable for retirees or those seeking regular income. However, be aware that high-dividend stocks can be sensitive to interest rate changes, and focusing solely on income might limit total return potential.`,
      category: 'optimization'
    });
  }
  
  // Risk Tolerance Alignment
  if (riskTolerance === 'low' && stockWeight > 50) {
    insights.push({
      title: "Risk Tolerance Misalignment",
      icon: Shield,
      content: `There's a potential mismatch between your stated low risk tolerance and your ${stockWeight.toFixed(1)}% stock allocation. Conservative investors typically hold 20-40% stocks to limit volatility. If you truly prefer stability, consider reducing stocks in favor of bonds or high-yield savings. However, if you can emotionally handle market fluctuations for long-term gain, you might reassess your risk tolerance. Remember, being too conservative can be risky too - inflation can erode purchasing power over time.`,
      category: 'strategy'
    });
  } else if (riskTolerance === 'high' && stockWeight < 70) {
    insights.push({
      title: "Opportunity for Growth",
      icon: TrendingUp,
      content: `With high risk tolerance and only ${stockWeight.toFixed(1)}% in stocks, you might be leaving growth potential on the table. Aggressive investors often hold 70-90% stocks to maximize long-term returns. If you have a long time horizon and can handle volatility, consider increasing equity exposure. Your current allocation might be appropriate if you're near major financial goals, but for long-term wealth building, higher stock allocations typically align better with high risk tolerance.`,
      category: 'strategy'
    });
  }
  
  // Diversification Insight
  const diversificationScore = result.current_metrics.diversification_score;
  if (diversificationScore < 7) {
    insights.push({
      title: "Diversification Enhancement Needed",
      icon: Target,
      content: `Your diversification score of ${diversificationScore.toFixed(1)} suggests room for improvement. Effective diversification means holding assets that don't all move together - when some decline, others may rise or remain stable. Consider adding alternative investments like REITs, commodities, or international exposure if not already included. Even within asset classes, diversify across sectors, company sizes, and geographies. The goal isn't just to own many things, but to own things that behave differently in various market conditions.`,
      category: 'strategy'
    });
  }
  
  // Alternative Assets Insight
  if (altWeight > 15) {
    insights.push({
      title: "Alternative Investment Strategy",
      icon: Target,
      content: `Your ${altWeight.toFixed(1)}% allocation to alternatives (REITs, commodities, crypto, private equity) shows sophisticated diversification thinking. Alternative investments can provide inflation protection, different return patterns, and portfolio stability. However, they often come with higher fees, less liquidity, and more complexity. Ensure you understand each alternative investment's risks, fees, and how it fits your overall strategy. Generally, 5-15% in alternatives is sufficient for most investors' diversification needs.`,
      category: 'strategy'
    });
  }
  
  return insights;
};

export const EducationalDropdown: React.FC<EducationalDropdownProps> = ({ 
  allocation, 
  result, 
  riskTolerance, 
  optimizationGoal, 
  targetReturn 
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  const insights = generateEducationalInsights(allocation, result, riskTolerance, optimizationGoal, targetReturn);

  const toggleExpansion = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'portfolio': return 'text-blue-600 dark:text-blue-400';
      case 'risk': return 'text-red-600 dark:text-red-400';
      case 'optimization': return 'text-green-600 dark:text-green-400';
      case 'strategy': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => {
        const isExpanded = expandedItems.has(index);
        const IconComponent = insight.icon;
        
        return (
          <div 
            key={index} 
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <button
              onClick={() => toggleExpansion(index)}
              className="w-full p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-primary-600 dark:text-primary-400 transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  )}
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <IconComponent className={`h-4 w-4 ${getCategoryColor(insight.category)}`} />
                  <span className="text-gray-900 dark:text-gray-100 font-medium leading-relaxed">
                    {insight.title}
                  </span>
                </div>
              </div>
              <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0 ml-2" />
            </button>
            
            {isExpanded && (
              <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        insight.category === 'portfolio' ? 'bg-blue-500' :
                        insight.category === 'risk' ? 'bg-red-500' :
                        insight.category === 'optimization' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}></div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {insights.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Educational Insights
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized educational content will appear here based on your portfolio analysis.
          </p>
        </div>
      )}
    </div>
  );
};