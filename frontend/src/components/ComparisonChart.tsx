import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PortfolioAllocation } from '../types';

interface ComparisonChartProps {
  currentAllocation: PortfolioAllocation;
  optimizedAllocation: PortfolioAllocation;
}

const COLORS = {
  stocks: '#3b82f6',
  bonds: '#22c55e',
  alternatives: '#f59e0b',
  cash: '#6b7280',
};

const GRADIENTS = {
  stocks: 'url(#stocksGradient)',
  bonds: 'url(#bondsGradient)',
  alternatives: 'url(#alternativesGradient)',
  cash: 'url(#cashGradient)',
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  currentAllocation, 
  optimizedAllocation 
}) => {
  const [activeView, setActiveView] = useState<'current' | 'optimized'>('current');

  const formatData = (allocation: PortfolioAllocation) => [
    {
      name: 'Stocks',
      value: allocation.stocks * 100,
      color: COLORS.stocks,
    },
    {
      name: 'Bonds',
      value: allocation.bonds * 100,
      color: COLORS.bonds,
    },
    {
      name: 'Alternatives',
      value: allocation.alternatives * 100,
      color: COLORS.alternatives,
    },
    {
      name: 'Cash',
      value: allocation.cash * 100,
      color: COLORS.cash,
    },
  ].filter(item => item.value > 0);

  const currentData = formatData(currentAllocation);
  const optimizedData = formatData(optimizedAllocation);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight="bold"
        style={{
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getChangeIndicator = (current: number, optimized: number) => {
    const diff = optimized - current;
    if (Math.abs(diff) < 0.5) return null;
    
    return (
      <span className={`text-xs font-medium ${
        diff > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50 animate-in">
      <div className="flex flex-col space-y-4">
        {/* Header with Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Portfolio Allocation
          </h3>
          
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveView('current')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeView === 'current'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setActiveView('optimized')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeView === 'optimized'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Optimized
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-6">
            {/* Chart */}
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    <linearGradient id="stocksGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="bondsGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                    <linearGradient id="alternativesGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="cashGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#9ca3af" />
                      <stop offset="100%" stopColor="#6b7280" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={activeView === 'current' ? currentData : optimizedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={110}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="rgba(255,255,255,0.8)"
                  >
                    {(activeView === 'current' ? currentData : optimizedData).map((entry, index) => {
                      const gradientKey = entry.name.toLowerCase() as keyof typeof GRADIENTS;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={GRADIENTS[gradientKey] || entry.color}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Allocation']}
                    contentStyle={{
                      backgroundColor: 'rgba(156, 163, 175, 0.85)', // Light grey with transparency
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      borderRadius: '12px',
                      color: '#1f2937', // Dark text for better contrast
                      fontSize: '14px',
                      fontWeight: '600',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation Breakdown */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                Allocation Breakdown
              </h4>
              
              <div className="space-y-3">
                {['stocks', 'bonds', 'alternatives', 'cash'].map((assetClass) => {
                  const color = COLORS[assetClass as keyof typeof COLORS];
                  const currentValue = currentAllocation[assetClass as keyof PortfolioAllocation] * 100;
                  const optimizedValue = optimizedAllocation[assetClass as keyof PortfolioAllocation] * 100;
                  const changeIndicator = getChangeIndicator(currentValue, optimizedValue);
                  
                  if (currentValue === 0 && optimizedValue === 0) return null;
                  
                  return (
                    <div key={assetClass} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600/30">
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="font-medium text-gray-900 dark:text-gray-100 capitalize truncate">
                          {assetClass === 'alternatives' ? 'Alternatives' : assetClass}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm ml-4">
                        <div className="text-center min-w-[70px] flex-shrink-0">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {currentValue.toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="text-center min-w-[70px] flex-shrink-0">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Optimal</div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {optimizedValue.toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="text-center min-w-[70px] flex-shrink-0">
                          {changeIndicator ? (
                            <>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Change</div>
                              <div className="font-semibold">{changeIndicator}</div>
                            </>
                          ) : (
                            <>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Change</div>
                              <div className="font-semibold text-gray-500 dark:text-gray-400">—</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};