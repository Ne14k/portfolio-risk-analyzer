import React from 'react';
import { Info } from 'lucide-react';

interface AllocationSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description: string;
  color: string;
  icon?: React.ReactNode;
  remainingAllocation?: number;
}

export const AllocationSlider = React.memo<AllocationSliderProps>(({
  label,
  value,
  onChange,
  description,
  color,
  remainingAllocation = 0,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [inputValue, setInputValue] = React.useState((value * 100).toFixed(1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    const numValue = parseFloat(inputVal);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onChange(numValue / 100);
    }
  };

  const handleInputBlur = () => {
    // Reset to current value if input is invalid
    setInputValue((value * 100).toFixed(1));
  };

  React.useEffect(() => {
    setInputValue((value * 100).toFixed(1));
  }, [value]);

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const sliderWidth = rect.width;
    const rawClickedValue = Math.max(0, Math.min(1, clickX / sliderWidth));
    
    // Round to nearest whole percent (0.01 increments)
    const clickedValue = Math.round(rawClickedValue * 100) / 100;
    
    // Always set to clicked value, automatic rebalancing will handle constraints
    onChange(clickedValue);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30 transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-800 transition-all"
            style={{ backgroundColor: color }}
          ></div>
          <label className="font-semibold text-gray-800 dark:text-gray-200">
            {label}
          </label>
          <div className="relative">
            <Info
              className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute bottom-6 left-0 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-xl py-3 px-4 whitespace-nowrap z-20 shadow-lg border border-gray-700 max-w-xs animate-in">
                <div className="absolute -bottom-1 left-3 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 border-r border-b border-gray-700"></div>
                {description}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-20 px-3 py-2 text-sm font-medium text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 input-glow focus:outline-none transition-all"
          />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">%</span>
        </div>
      </div>
      <div className="relative" onClick={handleSliderClick}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => {
            const rawValue = parseFloat(e.target.value);
            // Round to nearest whole percent (0.01 increments)
            const roundedValue = Math.round(rawValue * 100) / 100;
            onChange(roundedValue);
          }}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer slider transition-all"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
});