import React, { useState } from 'react';
import { Brain, MessageCircle, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PortfolioAllocation, RiskMetrics, ESGPreferences, TaxPreferences, SectorPreferences } from '../types';

interface AIRiskExplanationProps {
  allocation: PortfolioAllocation;
  metrics: RiskMetrics;
  riskTolerance: 'low' | 'medium' | 'high';
  optimizationGoal: 'sharpe' | 'risk' | 'return' | 'income';
  targetReturn: number;
  esgPreferences?: ESGPreferences;
  taxPreferences?: TaxPreferences;
  sectorPreferences?: SectorPreferences;
  useAIOptimization: boolean;
}

interface PortfolioScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  bgColor: string;
  explanation: string;
}

const generatePortfolioScore = (
  allocation: PortfolioAllocation,
  metrics: RiskMetrics,
  riskTolerance: 'low' | 'medium' | 'high',
  optimizationGoal: 'sharpe' | 'risk' | 'return' | 'income',
  targetReturn: number,
  esgPreferences?: ESGPreferences,
  taxPreferences?: TaxPreferences,
  sectorPreferences?: SectorPreferences,
  useAIOptimization?: boolean
): PortfolioScore => {
  let score = 0;
  let explanationFactors: string[] = [];
  
  const stockWeight = allocation.stocks * 100;
  const bondWeight = allocation.bonds * 100;
  const altWeight = allocation.alternatives * 100;
  const cashWeight = allocation.cash * 100;
  
  // 1. Risk-Adjusted Return Efficiency (25 points max)
  const sharpeScore = Math.min(25, Math.max(0, 
    metrics.sharpe_ratio < 0 ? 0 :
    metrics.sharpe_ratio > 2.5 ? 25 :
    (metrics.sharpe_ratio / 2.5) * 25
  ));
  score += sharpeScore;
  
  if (sharpeScore < 10) explanationFactors.push("Poor risk-adjusted returns");
  else if (sharpeScore > 20) explanationFactors.push("Excellent risk efficiency");
  
  // 2. Risk Tolerance Alignment (20 points max)
  let riskAlignmentScore = 0;
  if (riskTolerance === 'low') {
    if (stockWeight <= 30) riskAlignmentScore = 20;
    else if (stockWeight <= 50) riskAlignmentScore = 15;
    else if (stockWeight <= 70) riskAlignmentScore = 8;
    else riskAlignmentScore = 2;
    
    if (bondWeight >= 50) riskAlignmentScore += 3;
    if (cashWeight >= 10) riskAlignmentScore += 2;
  } else if (riskTolerance === 'medium') {
    if (stockWeight >= 40 && stockWeight <= 75) riskAlignmentScore = 20;
    else if (stockWeight >= 30 && stockWeight <= 85) riskAlignmentScore = 15;
    else if (stockWeight >= 20 && stockWeight <= 90) riskAlignmentScore = 10;
    else riskAlignmentScore = 5;
    
    if (bondWeight >= 15 && bondWeight <= 50) riskAlignmentScore += 2;
  } else { // high
    if (stockWeight >= 70) riskAlignmentScore = 20;
    else if (stockWeight >= 60) riskAlignmentScore = 15;
    else if (stockWeight >= 45) riskAlignmentScore = 10;
    else riskAlignmentScore = 3;
    
    if (altWeight >= 10) riskAlignmentScore += 3;
    if (cashWeight <= 5) riskAlignmentScore += 2;
  }
  score += riskAlignmentScore;
  
  if (riskAlignmentScore < 10) explanationFactors.push("Misaligned with risk tolerance");
  
  // 3. Optimization Goal Alignment (15 points max)
  let goalScore = 0;
  if (optimizationGoal === 'sharpe') {
    goalScore = Math.min(15, sharpeScore * 0.6);
  } else if (optimizationGoal === 'return') {
    const returnGap = Math.abs(metrics.expected_return - targetReturn);
    goalScore = Math.max(0, 15 - returnGap * 2);
  } else if (optimizationGoal === 'risk') {
    if (metrics.volatility <= 8) goalScore = 15;
    else if (metrics.volatility <= 12) goalScore = 12;
    else if (metrics.volatility <= 16) goalScore = 8;
    else goalScore = 3;
  } else { // income
    if (bondWeight >= 40) goalScore = 15;
    else if (bondWeight >= 25) goalScore = 10;
    else goalScore = 5;
  }
  score += goalScore;
  
  // 4. Diversification Quality (15 points max)
  const diversificationScore = Math.min(15, (metrics.diversification_score / 100) * 15);
  score += diversificationScore;
  
  if (diversificationScore < 8) explanationFactors.push("Poor diversification");
  
  // 5. Cash Drag Analysis (10 points max)
  let cashScore = 10;
  if (cashWeight > 25) cashScore = 2;
  else if (cashWeight > 15) cashScore = 5;
  else if (cashWeight > 10) cashScore = 7;
  else if (cashWeight > 5) cashScore = 9;
  else if (cashWeight >= 2) cashScore = 10;
  else cashScore = 8; // Some cash is good
  score += cashScore;
  
  if (cashWeight > 15) explanationFactors.push("Excessive cash drag");
  
  // 6. Advanced Preferences (15 points max)
  let advancedScore = 0;
  
  // ESG Alignment
  if (esgPreferences && esgPreferences.overall_importance > 0.3) {
    // Assuming alternatives include ESG-focused investments
    if (altWeight >= 5) advancedScore += 3;
    if (stockWeight <= 70) advancedScore += 2; // ESG typically means some moderation
    explanationFactors.push("ESG considerations integrated");
  }
  
  // Tax Efficiency
  if (taxPreferences) {
    if (taxPreferences.prefer_tax_efficient) {
      if (taxPreferences.account_type === 'taxable') {
        if (bondWeight <= 30) advancedScore += 3; // Bonds are tax-inefficient in taxable
        if (altWeight >= 5) advancedScore += 2; // Alternatives can be tax-efficient
      } else {
        advancedScore += 3; // Tax-advantaged accounts are good
      }
    }
    
    if (taxPreferences.tax_bracket > 0.32 && bondWeight > 40 && taxPreferences.account_type === 'taxable') {
      advancedScore -= 3; // High earner with lots of bonds in taxable account
      explanationFactors.push("Tax-inefficient bond allocation");
    }
  }
  
  // Sector Concentration
  if (sectorPreferences && sectorPreferences.max_sector_concentration <= 0.25) {
    advancedScore += 3; // Good concentration limits
  }
  
  // AI Optimization Usage
  if (useAIOptimization) {
    advancedScore += 2;
  }
  
  score += Math.min(15, advancedScore);
  
  // Apply precision penalty for unrealistic precision
  const totalAllocation = stockWeight + bondWeight + altWeight + cashWeight;
  if (Math.abs(totalAllocation - 100) > 0.1) {
    score -= 5;
    explanationFactors.push("Allocation doesn't sum to 100%");
  }
  
  // Final adjustments based on extreme portfolios
  if (stockWeight === 100) {
    score -= 8;
    explanationFactors.push("Excessive concentration risk");
  }
  if (bondWeight === 100) {
    score -= 5;
    explanationFactors.push("No growth potential");
  }
  if (cashWeight === 100) {
    score -= 15;
    explanationFactors.push("No investment growth");
  }
  
  // Ensure score is realistic and whole number
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine grade and styling
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  let color: string;
  let bgColor: string;
  let explanation: string;
  
  if (score >= 85) {
    grade = 'A';
    color = 'text-green-700 dark:text-green-300';
    bgColor = 'bg-green-100 dark:bg-green-900/30';
    explanation = 'Exceptional portfolio demonstrating sophisticated understanding of risk management, diversification, and goal alignment.';
  } else if (score >= 75) {
    grade = 'B';
    color = 'text-green-600 dark:text-green-400';
    bgColor = 'bg-green-50 dark:bg-green-900/20';
    explanation = 'Strong portfolio with good fundamentals and minor optimization opportunities.';
  } else if (score >= 65) {
    grade = 'C';
    color = 'text-yellow-600 dark:text-yellow-400';
    bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
    explanation = 'Decent portfolio with several areas for meaningful improvement.';
  } else if (score >= 50) {
    grade = 'D';
    color = 'text-orange-600 dark:text-orange-400';
    bgColor = 'bg-orange-50 dark:bg-orange-900/20';
    explanation = 'Suboptimal portfolio requiring significant restructuring for better risk-adjusted returns.';
  } else {
    grade = 'F';
    color = 'text-red-600 dark:text-red-400';
    bgColor = 'bg-red-50 dark:bg-red-900/20';
    explanation = 'Problematic portfolio with fundamental issues that could severely impact long-term wealth building.';
  }
  
  return { score, grade, color, bgColor, explanation };
};

const generatePlainEnglishExplanation = (
  allocation: PortfolioAllocation,
  metrics: RiskMetrics,
  riskTolerance: 'low' | 'medium' | 'high',
  optimizationGoal: 'sharpe' | 'risk' | 'return' | 'income',
  targetReturn: number,
  esgPreferences?: ESGPreferences,
  taxPreferences?: TaxPreferences,
  sectorPreferences?: SectorPreferences
): string => {
  const stockPercent = (allocation.stocks * 100).toFixed(0);
  const bondPercent = (allocation.bonds * 100).toFixed(0);
  const altPercent = (allocation.alternatives * 100).toFixed(0);
  const cashPercent = (allocation.cash * 100).toFixed(0);
  
  // Portfolio composition
  let explanation = `Your portfolio is ${stockPercent}% stocks, ${bondPercent}% bonds`;
  if (allocation.alternatives > 0.02) explanation += `, ${altPercent}% alternatives`;
  if (allocation.cash > 0.02) explanation += `, and ${cashPercent}% cash`;
  explanation += '. ';
  
  // Risk assessment with dollar impact
  const volatility = metrics.volatility;
  const expectedReturn = metrics.expected_return;
  
  if (volatility > 18) {
    explanation += `This is a high-risk portfolio with ${volatility.toFixed(1)}% volatility - expect significant ups and downs. On a $100,000 investment, you might see swings of $${(volatility * 1000).toFixed(0)}+ annually, requiring strong emotional discipline. `;
  } else if (volatility > 12) {
    explanation += `This moderate-risk portfolio has ${volatility.toFixed(1)}% volatility with reasonable fluctuations. On $100,000, expect annual swings of $${(volatility * 1000).toFixed(0)}, balancing growth with manageable risk. `;
  } else {
    explanation += `This conservative portfolio has low ${volatility.toFixed(1)}% volatility, prioritizing stability. On $100,000, expect minimal swings of only $${(volatility * 800).toFixed(0)} annually, though growth may be limited. `;
  }
  
  // Expected return and efficiency
  explanation += `Your ${expectedReturn.toFixed(1)}% expected annual return `;
  if (expectedReturn > 9) {
    explanation += `is ambitious and could grow $100k to ~$${(100000 * Math.pow(1 + expectedReturn/100, 20) / 1000).toFixed(0)}k over 20 years. `;
  } else if (expectedReturn > 6) {
    explanation += `provides solid growth, potentially reaching ~$${(100000 * Math.pow(1 + expectedReturn/100, 20) / 1000).toFixed(0)}k over 20 years. `;
  } else {
    explanation += `is conservative, growing $100k to only ~$${(100000 * Math.pow(1 + expectedReturn/100, 20) / 1000).toFixed(0)}k over 20 years. `;
  }
  
  // Risk efficiency
  if (metrics.sharpe_ratio > 1.0) {
    explanation += `Your ${metrics.sharpe_ratio.toFixed(2)} Sharpe ratio shows excellent risk-adjusted returns. `;
  } else {
    explanation += `Your ${metrics.sharpe_ratio.toFixed(2)} Sharpe ratio suggests room for better risk-adjusted performance. `;
  }
  
  // Cash impact or diversification
  if (allocation.cash > 0.15) {
    explanation += `Your ${cashPercent}% cash provides safety but creates significant growth drag compared to stocks' historical 10%+ returns. `;
  } else if (metrics.diversification_score < 60) {
    explanation += `Your portfolio concentration increases risk - better diversification could reduce volatility while maintaining returns. `;
  }
  
  // Risk tolerance alignment and target return analysis
  const returnGap = Math.abs(metrics.expected_return - targetReturn);
  if (returnGap > 2) {
    explanation += `Your ${metrics.expected_return.toFixed(1)}% expected return is ${metrics.expected_return > targetReturn ? 'above' : 'below'} your ${targetReturn}% target by ${returnGap.toFixed(1)} percentage points. `;
  }
  
  if (riskTolerance === 'low' && allocation.stocks > 0.6) {
    explanation += `⚠️ Your ${stockPercent}% stock allocation may be too aggressive for your conservative risk preference, potentially causing stress during downturns. `;
  } else if (riskTolerance === 'high' && allocation.stocks < 0.5) {
    explanation += `💡 Your conservative ${stockPercent}% stock allocation might not fully capitalize on your high risk tolerance for long-term growth. `;
  } else {
    explanation += `✅ Your allocation aligns well with your ${riskTolerance} risk tolerance and ${optimizationGoal} optimization goal. `;
  }
  
  // Advanced preferences analysis
  if (esgPreferences && esgPreferences.overall_importance > 0.5) {
    explanation += `Your high ESG importance (${(esgPreferences.overall_importance * 100).toFixed(0)}%) suggests you value sustainable investing - consider increasing alternatives allocation for more ESG-focused options. `;
  }
  
  if (taxPreferences) {
    if (taxPreferences.account_type === 'taxable' && taxPreferences.tax_bracket > 0.32 && allocation.bonds > 0.3) {
      explanation += `⚠️ Tax Alert: Your ${bondPercent}% bond allocation in a taxable account with a ${(taxPreferences.tax_bracket * 100).toFixed(0)}% tax bracket creates significant tax drag. Consider moving bonds to tax-advantaged accounts. `;
    } else if (taxPreferences.account_type !== 'taxable') {
      explanation += `✅ Good use of ${taxPreferences.account_type} account for tax efficiency. `;
    }
  }
  
  if (sectorPreferences && sectorPreferences.max_sector_concentration <= 0.2) {
    explanation += `Your conservative ${(sectorPreferences.max_sector_concentration * 100).toFixed(0)}% sector concentration limit shows good diversification discipline. `;
  }
  
  return explanation.trim();
};

const getCommonQuestions = (
  allocation: PortfolioAllocation,
  metrics: RiskMetrics
): Array<{question: string, answer: string}> => {
  const questions = [];
  
  if (metrics.sharpe_ratio < 1.0) {
    questions.push({
      question: "Why is my Sharpe ratio low?",
      answer: `Your Sharpe ratio of ${metrics.sharpe_ratio.toFixed(2)} suggests you're not getting optimal returns for the risk you're taking. This could be due to high cash holdings, poor diversification, or an asset mix that doesn't efficiently balance risk and return. Consider rebalancing to improve risk-adjusted performance.`
    });
  }
  
  if (metrics.volatility > 18) {
    questions.push({
      question: "Why is my portfolio so volatile?",
      answer: `Your ${metrics.volatility.toFixed(1)}% volatility comes primarily from your ${(allocation.stocks * 100).toFixed(0)}% stock allocation. Stocks are inherently more volatile than bonds or cash. If this makes you uncomfortable, consider reducing stock exposure and increasing bonds for stability.`
    });
  }
  
  if (allocation.cash > 0.15) {
    questions.push({
      question: "Is too much cash bad for my portfolio?",
      answer: `Your ${(allocation.cash * 100).toFixed(0)}% cash position provides safety but creates "cash drag" - it significantly reduces your long-term growth potential. While some cash is good for emergencies and peace of mind, excessive cash holdings can cost you tens of thousands in missed growth over decades.`
    });
  }
  
  if (metrics.diversification_score < 60) {
    questions.push({
      question: "How can I improve my diversification?",
      answer: `Your diversification score of ${metrics.diversification_score.toFixed(0)} suggests concentration risk. Consider spreading investments across more asset classes, geographic regions, or sectors. Adding international stocks, REITs, or other alternatives can help reduce overall portfolio risk.`
    });
  }
  
  questions.push({
    question: "What does expected return mean?",
    answer: `Your ${metrics.expected_return.toFixed(1)}% expected return is the average annual gain we'd anticipate based on historical data. Remember, this is an average - actual returns will vary significantly year to year. Some years you might lose money, others you might gain much more.`
  });
  
  return questions.slice(0, 3); // Return top 3 most relevant questions
};

export const AIRiskExplanation: React.FC<AIRiskExplanationProps> = ({
  allocation,
  metrics,
  riskTolerance,
  optimizationGoal,
  targetReturn,
  esgPreferences,
  taxPreferences,
  sectorPreferences,
  useAIOptimization
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  
  const portfolioScore = generatePortfolioScore(
    allocation, 
    metrics, 
    riskTolerance, 
    optimizationGoal, 
    targetReturn,
    esgPreferences,
    taxPreferences,
    sectorPreferences,
    useAIOptimization
  );
  const plainEnglishExplanation = generatePlainEnglishExplanation(
    allocation, 
    metrics, 
    riskTolerance, 
    optimizationGoal, 
    targetReturn,
    esgPreferences,
    taxPreferences,
    sectorPreferences
  );
  const commonQuestions = getCommonQuestions(allocation, metrics);
  
  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };
  
  const ScoreIcon = portfolioScore.score >= 70 ? CheckCircle : 
                   portfolioScore.score >= 55 ? AlertTriangle : 
                   TrendingUp;
  
  return (
    <div className="space-y-4">
      {/* Portfolio Score */}
      <div className={`${portfolioScore.bgColor} rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/30`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${portfolioScore.bgColor}`}>
              <Brain className={`h-5 w-5 ${portfolioScore.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Portfolio Score
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered portfolio analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className={`text-3xl font-bold ${portfolioScore.color}`}>
                {portfolioScore.score}
              </div>
              <div className={`text-sm font-medium ${portfolioScore.color}`}>
                Grade: {portfolioScore.grade}
              </div>
            </div>
            <ScoreIcon className={`h-8 w-8 ${portfolioScore.color}`} />
          </div>
        </div>
        
        <p className={`text-sm ${portfolioScore.color} font-medium`}>
          {portfolioScore.explanation}
        </p>
      </div>
      
      {/* Plain English Explanation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/30">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex-shrink-0">
            <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              What This Means in Plain English
            </h4>
            <p className="text-base text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
              {plainEnglishExplanation}
            </p>
          </div>
        </div>
      </div>
      
      {/* Common Questions */}
      {commonQuestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
            Common Questions About Your Portfolio
          </h4>
          
          {commonQuestions.map((qa, index) => {
            const isExpanded = expandedQuestions.has(index);
            
            return (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {qa.question}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-3 pb-3 bg-white dark:bg-gray-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {qa.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};