import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface RecommendationDropdownProps {
  recommendations: string[];
}

// Define explanations for common recommendations
const getRecommendationExplanation = (recommendation: string): string => {
  const rec = recommendation.toLowerCase();
  
  if (rec.includes('diversif')) {
    return "Diversification reduces risk by spreading investments across different asset classes. When one investment performs poorly, others may perform well, helping to stabilize your overall portfolio returns.";
  }
  
  if (rec.includes('rebalance')) {
    return "Rebalancing involves adjusting your portfolio back to your target allocation. Over time, some investments grow faster than others, causing your allocation to drift from your intended strategy.";
  }
  
  if (rec.includes('risk tolerance')) {
    return "Your risk tolerance should match your investment timeline and comfort level. Higher risk can lead to higher returns but also greater potential losses, especially in the short term.";
  }
  
  if (rec.includes('emergency fund')) {
    return "An emergency fund provides financial security and prevents you from having to sell investments during market downturns. Typically 3-6 months of expenses in cash or cash equivalents.";
  }
  
  if (rec.includes('fee') || rec.includes('cost')) {
    return "Investment fees compound over time and can significantly impact long-term returns. Even a 1% difference in annual fees can cost tens of thousands of dollars over decades.";
  }
  
  if (rec.includes('tax')) {
    return "Tax-efficient investing involves using accounts like 401(k)s and IRAs, holding tax-efficient funds, and being strategic about when you realize gains and losses.";
  }
  
  if (rec.includes('time horizon') || rec.includes('timeline')) {
    return "Your investment timeline affects how much risk you can take. Longer timelines allow for more aggressive strategies since you have time to recover from market downturns.";
  }
  
  if (rec.includes('dollar-cost averaging') || rec.includes('dca')) {
    return "Dollar-cost averaging involves investing a fixed amount regularly, regardless of market conditions. This can help reduce the impact of market volatility on your investments.";
  }
  
  if (rec.includes('bond') || rec.includes('fixed income')) {
    return "Bonds provide stability and income to a portfolio. They typically perform differently than stocks, helping to reduce overall portfolio volatility.";
  }
  
  if (rec.includes('stock') || rec.includes('equity')) {
    return "Stocks offer the potential for higher long-term returns but come with greater volatility. They represent ownership in companies and benefit from economic growth over time.";
  }
  
  // Default explanation
  return "This recommendation is based on modern portfolio theory and aims to optimize your risk-adjusted returns while aligning with your investment goals and risk tolerance.";
};

export const RecommendationDropdown: React.FC<RecommendationDropdownProps> = ({ recommendations }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpansion = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-3">
      {recommendations.map((recommendation, index) => {
        const isExpanded = expandedItems.has(index);
        const explanation = getRecommendationExplanation(recommendation);
        
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
                <span className="text-gray-900 dark:text-gray-100 font-medium leading-relaxed">
                  {recommendation}
                </span>
              </div>
              <Info className="h-4 w-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0 ml-2" />
            </button>
            
            {isExpanded && (
              <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="pt-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Great Portfolio!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your current portfolio allocation looks well-balanced for your risk tolerance and goals.
          </p>
        </div>
      )}
    </div>
  );
};