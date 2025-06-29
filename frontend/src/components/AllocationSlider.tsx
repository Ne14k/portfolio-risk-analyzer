import React from 'react';
import { Info } from 'lucide-react';

interface AllocationSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description: string;
  color: string;
}

export const AllocationSlider: React.FC<AllocationSliderProps> = ({
  label,
  value,
  onChange,
  description,
  color,
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <div className="relative">
            <Info
              className="h-4 w-4 text-gray-400 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute bottom-6 left-0 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg">
                {description}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 px-2 py-1 text-xs text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-xs text-gray-500">%</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 100}%, #d1d5db ${value * 100}%, #d1d5db 100%)`,
          }}
        />
      </div>
    </div>
  );
};