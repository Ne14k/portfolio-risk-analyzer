import React, { useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AssetAllocation } from '../types/portfolio';

interface AssetAllocationChartProps {
  allocation: AssetAllocation;
  title?: string;
}

const COLORS = {
  stocks: '#3b82f6',      // Blue
  etfs: '#8b5cf6',        // Purple
  crypto: '#f59e0b',      // Orange/Gold
  bonds: '#22c55e',       // Green
  realEstate: '#ef4444',  // Red
  cash: '#6b7280',        // Gray
  commodities: '#eab308', // Yellow
};

const GRADIENTS = {
  stocks: 'url(#stocksGradient)',
  etfs: 'url(#etfsGradient)',
  crypto: 'url(#cryptoGradient)',
  bonds: 'url(#bondsGradient)',
  realEstate: 'url(#realEstateGradient)',
  cash: 'url(#cashGradient)',
  commodities: 'url(#commoditiesGradient)',
};

const CATEGORY_LABELS = {
  stocks: 'Stocks',
  etfs: 'ETFs',
  crypto: 'Cryptocurrency',
  bonds: 'Bonds',
  realEstate: 'Real Estate',
  cash: 'Cash',
  commodities: 'Commodities',
};

export const AssetAllocationChart = React.memo<AssetAllocationChartProps>(({ 
  allocation, 
  title = "Asset Allocation" 
}) => {
  const data = useMemo(() => {
    return Object.entries(allocation)
      .map(([category, percentage]) => ({
        name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
        value: percentage,
        color: COLORS[category as keyof typeof COLORS],
        category: category,
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sort by percentage desc
  }, [allocation]);

  const renderCustomizedLabel = useCallback(({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
        style={{
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  }, []);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          {title}
        </h3>
        <div className="text-center py-8">
          <div className="w-48 h-48 mx-auto flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Add holdings to see allocation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
        {title}
      </h3>
      
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <defs>
                <linearGradient id="stocksGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="etfsGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="cryptoGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="bondsGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="realEstateGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#6b7280" />
                </linearGradient>
                <linearGradient id="commoditiesGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={3}
                stroke="rgba(255,255,255,0.9)"
              >
                {data.map((entry, index) => {
                  const gradientKey = entry.category as keyof typeof GRADIENTS;
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '12px',
                  color: '#1f2937',
                  fontSize: '14px',
                  fontWeight: '600',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 max-w-sm">
          <div className="space-y-3">
            {data.map((entry, index) => (
              <div key={entry.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});