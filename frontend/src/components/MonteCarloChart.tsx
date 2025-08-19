import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface MonteCarloResults {
  numSimulations: number;
  percentile5: number[];
  percentile25: number[];
  percentile50: number[];
  percentile75: number[];
  percentile95: number[];
  probabilityPositive: number;
  probabilityLoss5Percent: number;
  probabilityLoss10Percent: number;
  probabilityGain10Percent: number;
  probabilityGain20Percent: number;
  expectedValue: number;
  valueAtRisk5: number;
  valueAtRisk1: number;
  conditionalValueAtRisk: number;
  simulationSummary: {
    meanReturn: number;
    volatility: number;
    sharpeRatio: number;
    skewness: number;
    kurtosis: number;
    downsideDeviation: number;
    maximumDrawdown: number;
  };
}

interface MonteCarloChartProps {
  monteCarloResults: MonteCarloResults;
  currentValue: number;
  timeHorizon: string;
  className?: string;
}

export function MonteCarloChart({ 
  monteCarloResults, 
  currentValue, 
  timeHorizon,
  className = ""
}: MonteCarloChartProps) {
  // Get time period details
  const getTimePeriodInfo = (horizon: string) => {
    switch (horizon) {
      case '1_month': return { days: 30, label: 'Days', interval: 5 };
      case '3_months': return { days: 90, label: 'Days', interval: 15 };
      case '1_year': return { days: 365, label: 'Months', interval: 30 };
      default: return { days: 90, label: 'Days', interval: 15 };
    }
  };

  const timePeriodInfo = getTimePeriodInfo(timeHorizon);

  // Prepare chart data with proper time labels
  const chartData = monteCarloResults.percentile5.map((_, index) => {
    let timeLabel;
    if (timeHorizon === '1_year') {
      // For 1 year, show months
      timeLabel = Math.round((index / timePeriodInfo.days) * 12);
    } else {
      // For shorter periods, show days
      timeLabel = index;
    }
    
    return {
      day: index,
      timeLabel: timeLabel,
      percentile5: monteCarloResults.percentile5[index],
      percentile25: monteCarloResults.percentile25[index],
      percentile50: monteCarloResults.percentile50[index],
      percentile75: monteCarloResults.percentile75[index],
      percentile95: monteCarloResults.percentile95[index],
    };
  });

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

  const getTimeHorizonLabel = (horizon: string): string => {
    switch (horizon) {
      case '1_month': return '1 Month';
      case '3_months': return '3 Months';
      case '1_year': return '1 Year';
      default: return horizon;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monte Carlo Simulation Results
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {monteCarloResults.numSimulations.toLocaleString()} simulations over {getTimeHorizonLabel(timeHorizon)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="timeLabel" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={Math.max(1, Math.floor(chartData.length / 10))}
                tickFormatter={(value) => {
                  if (timeHorizon === '1_year') {
                    return `${value}mo`;
                  } else {
                    return `${value}d`;
                  }
                }}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => {
                  if (timeHorizon === '1_year') {
                    return `Month ${label}`;
                  } else {
                    return `Day ${label}`;
                  }
                }}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              
              {/* Confidence bands */}
              <defs>
                <linearGradient id="confidence90" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="confidence50" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              {/* Reference line for current value */}
              <ReferenceLine y={currentValue} stroke="#6B7280" strokeDasharray="5 5" opacity={0.7} />

              {/* Percentile lines */}
              <Line
                type="monotone"
                dataKey="percentile5"
                stroke="#EF4444"
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
                opacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="percentile25"
                stroke="#F59E0B"
                strokeWidth={1}
                dot={false}
                opacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="percentile50"
                stroke="#10B981"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="percentile75"
                stroke="#3B82F6"
                strokeWidth={1}
                dot={false}
                opacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="percentile95"
                stroke="#8B5CF6"
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
                opacity={0.8}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-500 opacity-80"></div>
            <span className="text-gray-600 dark:text-gray-400">5th percentile (worst 5%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-yellow-500 opacity-80"></div>
            <span className="text-gray-600 dark:text-gray-400">25th percentile</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">50th percentile (median)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-500 opacity-80"></div>
            <span className="text-gray-600 dark:text-gray-400">75th percentile</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-purple-500 opacity-80"></div>
            <span className="text-gray-600 dark:text-gray-400">95th percentile (best 5%)</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(monteCarloResults.expectedValue)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Expected Value</div>
          </div>


          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(monteCarloResults.valueAtRisk5)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Value at Risk (5%)</div>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {monteCarloResults.simulationSummary.sharpeRatio.toFixed(3)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</div>
          </div>
        </div>
      </div>
    </div>
  );
}