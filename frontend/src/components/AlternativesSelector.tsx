import React, { useState, useEffect } from 'react';
import { ChevronDown, Settings, TrendingUp, Trash2 } from 'lucide-react';

interface AlternativesBreakdown {
  crypto: number;
  reits: number;
  commodities: number;
  privateEquity: number;
}

interface AlternativesSelectorProps {
  value: number;
  onChange: (value: number) => void;
  description: string;
  color: string;
  remainingAllocation?: number;
}

const PRESET_ALTERNATIVES = {
  balanced: { crypto: 0.3, reits: 0.4, commodities: 0.2, privateEquity: 0.1 },
  growthFocused: { crypto: 0.5, reits: 0.3, commodities: 0.1, privateEquity: 0.1 },
  conservative: { crypto: 0.1, reits: 0.6, commodities: 0.2, privateEquity: 0.1 },
  techFocused: { crypto: 0.6, reits: 0.2, commodities: 0.1, privateEquity: 0.1 },
};

const ALTERNATIVE_DESCRIPTIONS = {
  crypto: "Digital assets like Bitcoin and Ethereum for growth potential",
  reits: "Real Estate Investment Trusts for income and inflation protection",
  commodities: "Physical assets like gold, oil, and agricultural products",
  privateEquity: "Private market investments for long-term growth"
};

export const AlternativesSelector: React.FC<AlternativesSelectorProps> = ({
  value,
  onChange,
  description,
  color,
  remainingAllocation = 0,
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESET_ALTERNATIVES>('balanced');
  const [customBreakdown, setCustomBreakdown] = useState<AlternativesBreakdown>({
    crypto: 0.3,
    reits: 0.4,
    commodities: 0.2,
    privateEquity: 0.1,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate total value from breakdown
  const calculateTotalFromBreakdown = (breakdown: AlternativesBreakdown) => {
    return Object.values(breakdown).reduce((sum, val) => sum + val, 0) * value;
  };

  // Update breakdown when preset changes
  useEffect(() => {
    if (!isCustom) {
      setCustomBreakdown(PRESET_ALTERNATIVES[selectedPreset]);
    }
  }, [selectedPreset, isCustom]);

  // Update custom breakdown proportionally when total value changes
  useEffect(() => {
    if (isCustom && value > 0) {
      const currentTotal = Object.values(customBreakdown).reduce((sum, val) => sum + val, 0);
      if (currentTotal > 0) {
        // Keep proportions but scale to current value
        const scaleFactor = 1 / currentTotal;
        setCustomBreakdown(prev => ({
          crypto: prev.crypto * scaleFactor,
          reits: prev.reits * scaleFactor,
          commodities: prev.commodities * scaleFactor,
          privateEquity: prev.privateEquity * scaleFactor,
        }));
      }
    }
  }, [value, isCustom]);

  const handleCustomBreakdownChange = (asset: keyof AlternativesBreakdown, newValue: number) => {
    setCustomBreakdown(prev => {
      // Calculate what the total would be with this change
      const otherTotal = Object.entries(prev)
        .filter(([k]) => k !== asset)
        .reduce((sum, [, val]) => sum + val, 0);
      
      // Don't allow the new value to make total exceed 1.0
      const maxAllowable = 1 - otherTotal;
      const constrainedValue = Math.min(newValue, maxAllowable);
      
      return {
        ...prev,
        [asset]: constrainedValue
      };
    });
  };

  const normalizeBreakdown = () => {
    const total = Object.values(customBreakdown).reduce((sum, val) => sum + val, 0);
    if (total > 0 && Math.abs(total - 1.0) > 0.01) {
      setCustomBreakdown(prev => 
        Object.entries(prev).reduce(
          (acc, [key, val]) => ({
            ...acc,
            [key]: val / total,
          }),
          {} as AlternativesBreakdown
        )
      );
    }
  };

  const resetBreakdown = () => {
    setCustomBreakdown({
      crypto: 0,
      reits: 0,
      commodities: 0,
      privateEquity: 0,
    });
  };

  const handleMainSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const sliderWidth = rect.width;
    const rawClickedValue = Math.max(0, Math.min(1, clickX / sliderWidth));
    
    // Round to nearest whole percent (0.01 increments)
    const clickedValue = Math.round(rawClickedValue * 100) / 100;
    
    // Always set to clicked value, automatic rebalancing will handle constraints
    onChange(clickedValue);
  };

  const handleBreakdownSliderClick = (e: React.MouseEvent<HTMLDivElement>, asset: keyof AlternativesBreakdown, currentValue: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const sliderWidth = rect.width;
    const rawClickedValue = Math.max(0, Math.min(1, clickX / sliderWidth));
    
    // Round to nearest whole percent (0.01 increments)
    const clickedValue = Math.round(rawClickedValue * 100) / 100;
    
    // Always set to clicked value, automatic rebalancing will handle constraints
    handleCustomBreakdownChange(asset, clickedValue);
  };

  const getCurrentBreakdown = () => {
    return isCustom ? customBreakdown : PRESET_ALTERNATIVES[selectedPreset];
  };

  const breakdownTotal = Object.values(getCurrentBreakdown()).reduce((sum, val) => sum + val, 0);
  const remainingBreakdown = 1 - breakdownTotal;

  return (
    <div className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30 transition-all duration-200">
      {/* Main Slider */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-800 transition-all"
            style={{ backgroundColor: color }}
          ></div>
          <label className="font-semibold text-gray-800 dark:text-gray-200">
            Alternatives
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={(value * 100).toFixed(1)}
            onChange={(e) => {
              const numValue = parseFloat(e.target.value);
              if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                onChange(numValue / 100);
              }
            }}
            className="w-20 px-3 py-2 text-sm font-medium text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">%</span>
        </div>
      </div>

      <div className="relative" onClick={handleMainSliderClick}>
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

      {/* Custom Toggle Button */}
      {value > 0 && (
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCustom(!isCustom)}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                isCustom 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Settings className="h-3 w-3" />
              <span>Custom</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Breakdown Editor */}
      {value > 0 && isCustom && (
        <div className="mt-4 space-y-4">
          {/* Breakdown Display/Editor */}
          <div className="space-y-4">
            {Object.entries(getCurrentBreakdown()).map(([asset, percentage]) => (
              <div key={asset} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {asset === 'reits' ? 'REITs' : 
                       asset === 'privateEquity' ? 'Private Equity' :
                       asset}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={(percentage * 100).toFixed(1)}
                      onChange={(e) => {
                        const numValue = parseFloat(e.target.value);
                        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                          handleCustomBreakdownChange(asset as keyof AlternativesBreakdown, numValue / 100);
                        }
                      }}
                      className="w-16 px-2 py-1 text-xs text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
                
                <div className="relative" onClick={(e) => handleBreakdownSliderClick(e, asset as keyof AlternativesBreakdown, percentage)}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={percentage}
                    onChange={(e) => {
                      const rawValue = parseFloat(e.target.value);
                      // Round to nearest whole percent (0.01 increments)
                      const roundedValue = Math.round(rawValue * 100) / 100;
                      handleCustomBreakdownChange(asset as keyof AlternativesBreakdown, roundedValue);
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer slider transition-all"
                    style={{
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage * 100}%, #e5e7eb ${percentage * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Custom breakdown total */}
            <div className={`mt-3 p-3 rounded-lg transition-colors ${
              Math.abs(breakdownTotal - 1) < 0.0001 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : breakdownTotal > 1 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">Breakdown Total:</span>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${
                      Math.abs(breakdownTotal - 1) < 0.0001 ? 'text-green-600 dark:text-green-400' : 
                      breakdownTotal > 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {(breakdownTotal * 100).toFixed(1)}%
                    </span>
                    {Math.abs(breakdownTotal - 1) >= 0.0001 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({remainingBreakdown > 0 ? '+' : ''}{(remainingBreakdown * 100).toFixed(1)}% remaining)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={resetBreakdown}
                    className="flex items-center justify-center w-6 h-6 bg-gray-200 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-105 group"
                    title="Reset all breakdown allocations to 0%"
                  >
                    <Trash2 className="h-3 w-3 text-gray-500 group-hover:text-red-500 dark:text-gray-400 dark:group-hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {description}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};