import React, { useState, useEffect, useCallback } from 'react';
import { Search, Autorenew, TrendingUp, Business, CurrencyBitcoin } from '@mui/icons-material';
import { searchStocks, finnhubService } from '../services/finnhub';
import type { StockSearchResult } from '../services/finnhub';

interface StockSearchProps {
  onSelect: (stock: { symbol: string; name: string; type: string }) => void;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onLookup?: () => void;
}

export function StockSearch({ onSelect, placeholder = "Search stocks, ETFs, crypto...", className = "", value, onChange, onLookup }: StockSearchProps) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [apiStatus, setApiStatus] = useState(finnhubService.getApiStatus());
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchDisabled, setSearchDisabled] = useState(false);

  // Sync external value with internal state
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value, query]);

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery: string) => {
    const searchFunc = debounce(async (query: string) => {
      if (query.length < 1) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Starting search for:', query);
        const searchResults = await searchStocks(query);
        console.log('Search results received:', searchResults);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    searchFunc(searchQuery);
  }, []);

  useEffect(() => {
    if (!searchDisabled) {
      debouncedSearch(query);
    }
    setSelectedIndex(-1); // Reset selection when query changes
  }, [query, debouncedSearch, searchDisabled]);

  useEffect(() => {
    // Check API status on mount
    setApiStatus(finnhubService.getApiStatus());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1); // Reset selection when typing
    setSearchDisabled(false); // Re-enable search when user manually types
  };

  const handleSelect = (stock: StockSearchResult) => {
    setQuery(stock.symbol);
    onChange?.(stock.symbol);
    onSelect({ symbol: stock.symbol, name: stock.name, type: stock.type });
    setShowResults(false);
    setSelectedIndex(-1);
    setSearchDisabled(true); // Disable search completely after selection
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        // Select the highlighted result
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0 && query.trim()) {
        // Auto-select the first result if there are results
        handleSelect(results[0]);
      } else if (query.trim()) {
        // Just trigger lookup with current value
        onLookup?.();
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Autorenew className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            results.map((stock, index) => (
              <button
                key={`${stock.symbol}-${index}`}
                onClick={() => handleSelect(stock)}
                className={`w-full px-4 py-3 text-left border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors ${
                  index === selectedIndex 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stock.symbol}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                        {stock.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      {stock.name}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {stock.type === 'ETF' ? (
                      <Business className="h-4 w-4 text-blue-500" />
                    ) : stock.type === 'Crypto' ? (
                      <CurrencyBitcoin className="h-4 w-4 text-orange-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              {loading ? 'Searching...' : 'No results found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default StockSearch;