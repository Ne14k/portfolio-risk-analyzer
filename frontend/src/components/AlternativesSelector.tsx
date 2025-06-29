import React, { useState, useEffect } from 'react';
import { ChevronDown, Settings, TrendingUp } from 'lucide-react';

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
    const newBreakdown = { ...customBreakdown, [asset]: newValue };
    const total = Object.values(newBreakdown).reduce((sum, val) => sum + val, 0);
    
    if (total <= 1.0) {
      setCustomBreakdown(newBreakdown);
    }
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

  const getCurrentBreakdown = () => {
    return isCustom ? customBreakdown : PRESET_ALTERNATIVES[selectedPreset];
  };

  const breakdownTotal = Object.values(getCurrentBreakdown()).reduce((sum, val) => sum + val, 0);

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

      <div className="relative group">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer slider transition-all"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 w-2 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ 
            left: `calc(${value * 100}% - 4px)`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}50`
          }}
        ></div>
      </div>

      {/* Alternatives Breakdown */}
      {value > 0 && (
        <div className="mt-6 space-y-4">
          {/* Toggle between Custom and Preset */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Breakdown
            </h4>
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

          {/* Preset Selector */}
          {!isCustom && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {selectedPreset.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                  {Object.keys(PRESET_ALTERNATIVES).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setSelectedPreset(preset as keyof typeof PRESET_ALTERNATIVES);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {preset.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {preset === 'balanced' && 'Diversified across all alternatives'}
                        {preset === 'growthFocused' && 'Higher allocation to growth assets'}
                        {preset === 'conservative' && 'Focus on stable income-generating assets'}
                        {preset === 'techFocused' && 'Emphasis on digital and tech assets'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                  
                  {isCustom ? (
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
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(percentage * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                
                {isCustom && (
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={percentage}
                      onChange={(e) => handleCustomBreakdownChange(asset as keyof AlternativesBreakdown, parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer slider transition-all"
                      style={{
                        background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage * 100}%, #e5e7eb ${percentage * 100}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>
                )}
                
                {!isCustom && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage * 100}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}

            {/* Custom breakdown total and normalize */}
            {isCustom && (
              <div className={`mt-3 p-3 rounded-lg transition-colors ${
                Math.abs(breakdownTotal - 1) < 0.01 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Breakdown Total:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${
                      Math.abs(breakdownTotal - 1) < 0.01 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {(breakdownTotal * 100).toFixed(1)}%
                    </span>
                    {Math.abs(breakdownTotal - 1) > 0.01 && (
                      <button
                        onClick={normalizeBreakdown}
                        className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 underline"
                      >
                        Normalize
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
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