import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PortfolioAllocation } from '../types';

interface AllocationChartProps {
  allocation: PortfolioAllocation;
  title: string;
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

export const AllocationChart: React.FC<AllocationChartProps> = ({ allocation, title }) => {
  const data = [
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

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for small slices
    
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

  return (
    <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm animate-in">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
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
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={90}
            innerRadius={30}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={2}
            stroke="rgba(255,255,255,0.8)"
          >
            {data.map((entry, index) => {
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
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};