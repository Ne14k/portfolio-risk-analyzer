import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PortfolioAllocation } from '../types';

interface AllocationChartProps {
  allocation: PortfolioAllocation;
  title: string;
}

const COLORS = {
  stocks: '#3b82f6',
  bonds: '#10b981',
  alternatives: '#f59e0b',
  cash: '#6b7280',
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
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
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
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};