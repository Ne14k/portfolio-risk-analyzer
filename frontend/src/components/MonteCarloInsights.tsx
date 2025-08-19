import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Target, Activity, Lightbulb } from 'lucide-react';

interface MonteCarloInsightsProps {
  insights: string[];
  monteCarloResults: {
    probabilityPositive: number;
    probabilityLoss10Percent: number;
    probabilityGain20Percent: number;
    valueAtRisk5: number;
    expectedValue: number;
    simulationSummary: {
      volatility: number;
      sharpeRatio: number;
      skewness: number;
    };
  };
  currentValue: number;
  className?: string;
}

export function MonteCarloInsights({ 
  insights, 
  monteCarloResults, 
  currentValue,
  className = ""
}: MonteCarloInsightsProps) {
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getInsightIcon = (insight: string): React.ReactNode => {
    if (insight.includes('🎯') || insight.includes('positive')) {
      return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    } else if (insight.includes('⚠️') || insight.includes('risk') || insight.includes('loss')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    } else if (insight.includes('🚀') || insight.includes('upside') || insight.includes('gain')) {
      return <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    } else if (insight.includes('📉') || insight.includes('negative') || insight.includes('poor')) {
      return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    } else if (insight.includes('📊') || insight.includes('volatility')) {
      return <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    } else if (insight.includes('⭐') || insight.includes('excellent')) {
      return <Target className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }
    return <Lightbulb className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  };

  const getInsightColor = (insight: string): string => {
    if (insight.includes('🎯') || insight.includes('positive') || insight.includes('⭐')) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    } else if (insight.includes('⚠️') || insight.includes('risk') || insight.includes('loss')) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    } else if (insight.includes('🚀') || insight.includes('upside') || insight.includes('gain')) {
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
    } else if (insight.includes('📉') || insight.includes('negative') || insight.includes('poor')) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    } else if (insight.includes('📊') || insight.includes('volatility')) {
      return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';
    }
    return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
  };

  // Clean up emoji from insight text for better display
  const cleanInsight = (insight: string): string => {
    return insight.replace(/^[🎯⚠️🚀📉📊⭐🌪️📈]+\s*/, '');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Monte Carlo Insights
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Key takeaways from the simulation analysis
        </p>
      </div>

      {/* Insights */}
      <div className="p-6">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                  {cleanInsight(insight)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercentage(monteCarloResults.probabilityLoss10Percent)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Risk of 10%+ Loss</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercentage(monteCarloResults.probabilityGain20Percent)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Chance of 20%+ Gain</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercentage(monteCarloResults.simulationSummary.volatility)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Expected Volatility</div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Risk Assessment
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Expected Return</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(monteCarloResults.expectedValue - currentValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Risk-Adjusted Return</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {monteCarloResults.simulationSummary.sharpeRatio.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Outcome Skewness</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {monteCarloResults.simulationSummary.skewness > 0 ? 'Positive' : 'Negative'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}