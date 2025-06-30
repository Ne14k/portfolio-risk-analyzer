import React from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  explanation: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  explanation,
  trend = 'neutral',
  icon,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-secondary-600 dark:text-secondary-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-primary-600 dark:text-primary-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50 metric-card animate-in hover:scale-105 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              {icon}
            </div>
          )}
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {trend !== 'neutral' && (
            <div className={`p-1 rounded-full ${getTrendColor().replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}/20`}>
              <div className={getTrendColor()}>
                {getTrendIcon()}
              </div>
            </div>
          )}
          <div className="relative">
            <Info
              className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="fixed bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-xl py-4 px-6 w-80 shadow-2xl border border-gray-700 z-[9999]"
                style={{ 
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  whiteSpace: 'normal',
                  lineHeight: '1.5'
                }}>
                {explanation}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`text-3xl font-bold ${getTrendColor()} mb-2`}>
        {value}
      </div>
    </div>
  );
};