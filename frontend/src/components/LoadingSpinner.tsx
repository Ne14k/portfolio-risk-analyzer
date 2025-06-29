import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full border-2 border-primary-200 dark:border-primary-800"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
      <div className="absolute inset-1 rounded-full border border-transparent border-t-primary-500 dark:border-t-primary-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
    </div>
  );
};

export const LoadingPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex space-x-2 ${className}`}>
    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
  </div>
);

export const LoadingShimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`shimmer bg-gray-300 dark:bg-gray-700 rounded-lg ${className}`}>
    <div className="animate-shimmer bg-white/60 dark:bg-white/10"></div>
  </div>
);