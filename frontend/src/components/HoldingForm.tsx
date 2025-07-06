import React, { useState, useEffect } from 'react';
import { Close, Search, Autorenew } from '@mui/icons-material';
import { PortfolioService, getStockQuote } from '../services/portfolio';
import { HoldingFormData, HoldingFormErrors, AssetCategory } from '../types/portfolio';
import { StockSearch } from './StockSearch';

interface HoldingFormProps {
  onClose: () => void;
  onSave: () => void;
  editingHoldingId?: string;
}

export function HoldingForm({ onClose, onSave, editingHoldingId }: HoldingFormProps) {
  const [formData, setFormData] = useState<HoldingFormData>({
    ticker: '',
    name: '',
    quantity: 1,
    purchasePrice: 0,
    currentPrice: 0,
    category: 'stocks'
  });
  
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [errors, setErrors] = useState<HoldingFormErrors>({});

  // Load existing holding data if editing
  useEffect(() => {
    if (editingHoldingId) {
      const portfolio = PortfolioService.loadPortfolio();
      const holding = portfolio?.holdings.find(h => h.id === editingHoldingId);
      if (holding) {
        setFormData({
          ticker: holding.ticker,
          name: holding.name,
          quantity: holding.quantity,
          purchasePrice: holding.purchasePrice,
          currentPrice: holding.currentPrice,
          category: holding.category
        });
      }
    }
  }, [editingHoldingId]);

  const assetCategories: { value: AssetCategory; label: string }[] = [
    { value: 'stocks', label: 'Stocks' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'realEstate', label: 'Real Estate' },
    { value: 'cash', label: 'Cash' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'commodities', label: 'Commodities' }
  ];

  const handleTickerLookup = async () => {
    if (!formData.ticker.trim()) return;

    setPriceLoading(true);
    try {
      const quote = await getStockQuote(formData.ticker.toUpperCase());
      if (quote) {
        setFormData(prev => ({
          ...prev,
          name: quote.name,
          currentPrice: quote.price
        }));
      } else {
        // If no quote found, clear the name field so user can enter manually
        setFormData(prev => ({
          ...prev,
          name: ''
        }));
      }
    } catch (error) {
      console.error('Error fetching stock quote:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: HoldingFormErrors = {};

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker symbol is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Company/fund name is required';
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    if (formData.currentPrice <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingHoldingId) {
        PortfolioService.updateHolding(editingHoldingId, formData);
      } else {
        PortfolioService.addHolding(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving holding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof HoldingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof HoldingFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingHoldingId ? 'Edit Holding' : 'Add New Holding'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Stock Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Stock or ETF
            </label>
            <div className="space-y-2">
              <StockSearch
                onSelect={async (stock) => {
                  handleInputChange('ticker', stock.symbol);
                  handleInputChange('name', stock.name);
                  // Auto-lookup price after selection
                  setPriceLoading(true);
                  try {
                    const quote = await getStockQuote(stock.symbol);
                    if (quote) {
                      setFormData(prev => ({
                        ...prev,
                        ticker: stock.symbol,
                        name: stock.name,
                        currentPrice: quote.price
                      }));
                    }
                  } catch (error) {
                    console.error('Error fetching stock quote:', error);
                  } finally {
                    setPriceLoading(false);
                  }
                }}
                placeholder="Search by symbol or company name..."
              />
              
              {/* Manual ticker input fallback */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
                  placeholder="Or enter ticker manually (e.g., AAPL)"
                  className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.ticker ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleTickerLookup}
                  disabled={!formData.ticker.trim() || priceLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {priceLoading ? (
                    <Autorenew className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>Lookup</span>
                </button>
              </div>
            </div>
            {errors.ticker && (
              <p className="text-red-500 text-sm mt-1">{errors.ticker}</p>
            )}
          </div>

          {/* Company/Fund Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company/Fund Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Apple Inc., Vanguard S&P 500 ETF"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Asset Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asset Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as AssetCategory)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {assetCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantity: {formData.quantity}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="1000"
                step="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purchase Price (per share)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.purchasePrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>
            {errors.purchasePrice && (
              <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>
            )}
          </div>

          {/* Current Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Price (per share)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) => handleInputChange('currentPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.currentPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>
            {errors.currentPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPrice}</p>
            )}
          </div>

          {/* Market Value Preview */}
          {formData.quantity > 0 && formData.currentPrice > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Market Value:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${(formData.quantity * formData.currentPrice).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
              {formData.purchasePrice > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Gain/Loss:</span>
                  <span className={`font-semibold ${
                    (formData.currentPrice - formData.purchasePrice) * formData.quantity >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    ${((formData.currentPrice - formData.purchasePrice) * formData.quantity).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Autorenew className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingHoldingId ? 'Update Holding' : 'Add Holding'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}