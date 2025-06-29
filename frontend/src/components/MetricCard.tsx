import React from 'react';
import { Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  explanation: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  explanation,
  trend = 'neutral',
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        <div className="relative">
          <Info
            className="h-4 w-4 text-gray-400 cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute bottom-6 right-0 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10 max-w-xs">
              {explanation}
            </div>
          )}
        </div>
      </div>
      <div className={`text-2xl font-bold ${getTrendColor()}`}>
        {value}
      </div>
    </div>
  );
};