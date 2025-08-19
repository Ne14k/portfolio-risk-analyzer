import React, { useState, useEffect } from 'react';
import { Close, Search, Autorenew, Add, Remove } from '@mui/icons-material';
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
    quantity: 0,
    currentPrice: 0,
    category: 'stocks',
    holdingValue: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [errors, setErrors] = useState<HoldingFormErrors>({});
  const [quantityDisplay, setQuantityDisplay] = useState('');
  const [holdingValueDisplay, setHoldingValueDisplay] = useState('');

  // Load existing holding data if editing
  useEffect(() => {
    const loadHoldingData = async () => {
      if (editingHoldingId) {
        try {
          const portfolio = await PortfolioService.loadPortfolio();
          const holding = portfolio?.holdings.find(h => h.id === editingHoldingId);
          if (holding) {
            const holdingValue = holding.quantity * holding.currentPrice;
            setFormData({
              ticker: holding.ticker,
              name: holding.name,
              quantity: holding.quantity,
              currentPrice: holding.currentPrice,
              category: holding.category,
              holdingValue: holdingValue
            });
            setQuantityDisplay(holding.quantity.toString());
            setHoldingValueDisplay(holdingValue.toFixed(2));
          }
        } catch (error) {
          console.error('Error loading holding data:', error);
        }
      }
    };

    loadHoldingData();
  }, [editingHoldingId]);

  const assetCategories: { value: AssetCategory; label: string }[] = [
    { value: 'stocks', label: 'Stocks' },
    { value: 'etfs', label: 'ETFs' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'realEstate', label: 'Real Estate' },
    { value: 'cash', label: 'Cash' },
    { value: 'commodities', label: 'Commodities' }
  ];

  const handleTickerLookup = async () => {
    if (!formData.ticker.trim()) return;

    setPriceLoading(true);
    try {
      const quote = await getStockQuote(formData.ticker.toUpperCase());
      if (quote) {
        // Set category based on quote type
        const categoryMap: Record<string, AssetCategory> = {
          'Stock': 'stocks',
          'ETF': 'etfs',
          'Crypto': 'crypto'
        };
        const category = quote.type ? categoryMap[quote.type] || 'stocks' : 'stocks';
        
        setFormData(prev => ({
          ...prev,
          name: quote.name,
          currentPrice: quote.price,
          category: category,
          holdingValue: calculateHoldingValue(prev.quantity, quote.price)
        }));
        setHoldingValueDisplay(calculateHoldingValue(formData.quantity, quote.price).toFixed(2));
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

  // Helper function to determine if category uses simplified form (only holding value)
  const isSimplifiedCategory = (category: AssetCategory): boolean => {
    return ['bonds', 'commodities', 'cash', 'realEstate'].includes(category);
  };

  const validateForm = (): boolean => {
    console.log('🔍 Validating form with data:', formData);
    console.log('🔍 Category specifically:', formData.category);
    const newErrors: HoldingFormErrors = {};
    const isSimplified = isSimplifiedCategory(formData.category);

    // Ticker is only required for non-simplified categories
    if (!isSimplified && !formData.ticker.trim()) {
      console.log('❌ Ticker validation failed:', formData.ticker);
      newErrors.ticker = 'Symbol/identifier is required';
    }
    if (!formData.name.trim()) {
      console.log('❌ Name validation failed:', formData.name);
      newErrors.name = 'Name is required';
    }

    if (isSimplified) {
      // For simplified categories, only validate holding value
      if (!formData.holdingValue || formData.holdingValue <= 0) {
        console.log('❌ Holding value validation failed:', formData.holdingValue);
        newErrors.holdingValue = 'Holding value must be greater than 0';
      }
    } else {
      // For regular categories, validate quantity and current price
      if (formData.quantity <= 0) {
        console.log('❌ Quantity validation failed:', formData.quantity);
        newErrors.quantity = 'Quantity must be greater than 0';
      }
      if (formData.currentPrice <= 0) {
        console.log('❌ Current price validation failed:', formData.currentPrice);
        newErrors.currentPrice = 'Current price must be greater than 0';
      }
    }

    console.log('📊 Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('📈 Form is valid:', isValid);
    console.log('📈 Will submit with category:', formData.category);
    return isValid;
  };

  // Check if form has valid data for enabling the submit button
  const isFormValid = (): boolean => {
    const isSimplified = isSimplifiedCategory(formData.category);
    
    if (isSimplified) {
      return (
        formData.name.trim() !== '' &&
        (formData.holdingValue || 0) > 0
      );
    } else {
      return (
        formData.ticker.trim() !== '' &&
        formData.name.trim() !== '' &&
        formData.quantity > 0 &&
        formData.currentPrice > 0
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 FORM SUBMIT TRIGGERED!');
    console.log('📄 Form data before validation:', formData);

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    console.log('✅ Form validation passed');

    setLoading(true);
    try {
      console.log('🔄 Form submission started with data:', formData);
      
      // Prepare submission data based on category type
      const isSimplified = isSimplifiedCategory(formData.category);
      const submissionData = isSimplified ? {
        ...formData,
        ticker: formData.ticker.trim() || formData.name.substring(0, 10).toUpperCase().replace(/\s+/g, ''), // Use name as ticker if empty
        quantity: 1, // Set quantity to 1 for simplified categories
        currentPrice: formData.holdingValue || 0 // Use holding value as current price
      } : formData;
      
      console.log('📤 Prepared submission data:', submissionData);
      
      let result;
      if (editingHoldingId) {
        console.log('📝 Updating existing holding...');
        result = await PortfolioService.updateHolding(editingHoldingId, submissionData);
      } else {
        console.log('➕ Adding new holding...');
        result = await PortfolioService.addHolding(submissionData);
      }
      
      console.log('📋 Operation result:', result);
      
      if (result) {
        console.log('✅ Holding saved successfully, calling onSave and onClose');
        onSave();
        onClose();
      } else {
        console.error('❌ Failed to save holding - result was null/false');
        alert('Failed to save holding. Please check the console for errors.');
      }
    } catch (error) {
      console.error('❌ Error saving holding:', error);
      alert(`Error saving holding: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate holding value from quantity and current price
  const calculateHoldingValue = (quantity: number, currentPrice: number): number => {
    const value = quantity * currentPrice;
    return Math.round(value * 100) / 100; // Round to 2 decimal places
  };

  // Calculate quantity from holding value and current price
  const calculateQuantity = (holdingValue: number, currentPrice: number): number => {
    return currentPrice > 0 ? holdingValue / currentPrice : 0;
  };

  const handleInputChange = (field: keyof HoldingFormData, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Update bidirectional calculations
      if (field === 'quantity' && typeof value === 'number' && prev.currentPrice > 0) {
        // When quantity changes, update holding value
        newData.holdingValue = calculateHoldingValue(value, prev.currentPrice);
        setHoldingValueDisplay(newData.holdingValue.toFixed(2));
      } else if (field === 'holdingValue' && typeof value === 'number' && prev.currentPrice > 0) {
        // When holding value changes, calculate nearest valid quantity (up to 6 decimal places)
        const calculatedQuantity = calculateQuantity(value, prev.currentPrice);
        newData.quantity = Math.round(calculatedQuantity * 1000000) / 1000000; // Round to 6 decimal places
        setQuantityDisplay(newData.quantity.toString());
      } else if (field === 'currentPrice' && typeof value === 'number') {
        // When current price changes, update holding value based on current quantity
        newData.holdingValue = calculateHoldingValue(prev.quantity, value);
        setHoldingValueDisplay(newData.holdingValue.toFixed(2));
      }

      return newData;
    });
    
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
          {/* Search and Ticker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {(formData.category === 'stocks' || formData.category === 'etfs' || formData.category === 'crypto') 
                ? 'Search Stocks, ETFs, or Crypto' 
                : 'Symbol/Identifier (Optional)'}
            </label>
            <div className="space-y-3">
              {(formData.category === 'stocks' || formData.category === 'etfs' || formData.category === 'crypto') ? (
                <>
                  <StockSearch
                    value={formData.ticker}
                    onChange={(value) => handleInputChange('ticker', value)}
                    onSelect={async (stock) => {
                    // Prevent search from reopening by not triggering onChange during selection
                    // Automatically trigger lookup to get the current price
                    setPriceLoading(true);
                    try {
                      const quote = await getStockQuote(stock.symbol.toUpperCase());
                      if (quote) {
                        // Set category based on quote type (API is more accurate than search result)
                        const categoryMap: Record<string, AssetCategory> = {
                          'Stock': 'stocks',
                          'ETF': 'etfs',
                          'Crypto': 'crypto'
                        };
                        const quoteCategory = quote.type ? categoryMap[quote.type] || 'stocks' : 'stocks';
                        
                        const newHoldingValue = calculateHoldingValue(formData.quantity, quote.price);
                        setFormData(prev => ({
                          ...prev,
                          ticker: stock.symbol,
                          name: quote.name,
                          currentPrice: quote.price,
                          category: quoteCategory,
                          holdingValue: newHoldingValue
                        }));
                        setHoldingValueDisplay(newHoldingValue.toFixed(2));
                        // Ensure quantity display is set
                        if (formData.quantity > 0) {
                          setQuantityDisplay(formData.quantity.toString());
                        }
                      } else {
                        // If lookup fails, still set the basic info from search
                        const categoryMap: Record<string, AssetCategory> = {
                          'Stock': 'stocks',
                          'ETF': 'etfs',
                          'Crypto': 'crypto'
                        };
                        const category = categoryMap[stock.type] || 'stocks';
                        
                        setFormData(prev => ({
                          ...prev,
                          ticker: stock.symbol,
                          name: stock.name,
                          category: category
                        }));
                      }
                    } catch (error) {
                      console.error('Error fetching stock quote:', error);
                      // If lookup fails, still set the basic info from search
                      const categoryMap: Record<string, AssetCategory> = {
                        'Stock': 'stocks',
                        'ETF': 'etfs',
                        'Crypto': 'crypto'
                      };
                      const category = categoryMap[stock.type] || 'stocks';
                      
                      setFormData(prev => ({
                        ...prev,
                        ticker: stock.symbol,
                        name: stock.name,
                        category: category
                      }));
                    } finally {
                      setPriceLoading(false);
                    }
                  }}
                    onLookup={handleTickerLookup}
                    placeholder="Search or enter ticker (e.g., AAPL, SPY, BTC)..."
                  />
                  
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleTickerLookup}
                      disabled={!formData.ticker.trim() || priceLoading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {priceLoading ? (
                        <Autorenew className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span>Lookup</span>
                    </button>
                  </div>
                </>
              ) : (
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => handleInputChange('ticker', e.target.value)}
                  placeholder="Optional: Enter symbol or identifier (e.g., BOND001, GOLD, PROPERTY1)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              )}
            </div>
            {errors.ticker && (
              <p className="text-red-500 text-sm mt-1">{errors.ticker}</p>
            )}
          </div>

          {/* Company/Fund Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isSimplifiedCategory(formData.category) ? 'Holding Name' : 'Company/Fund Name'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={isSimplifiedCategory(formData.category) 
                ? "e.g., Government Bonds, Real Estate Investment, Gold Bars"
                : "e.g., Apple Inc., Vanguard S&P 500 ETF"}
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

          {/* Current Price - Only show for stocks, ETFs, and crypto */}
          {!isSimplifiedCategory(formData.category) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Price (per share)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <input
                  type="text"
                  value={formData.currentPrice ? formData.currentPrice.toFixed(2) : ''}
                  readOnly={formData.category === 'stocks' || formData.category === 'etfs' || formData.category === 'crypto'}
                  onChange={(e) => {
                    const inputValue = e.target.value.trim();
                    
                    // Allow empty input
                    if (inputValue === '') {
                      handleInputChange('currentPrice', 0);
                      return;
                    }
                    
                    // Only allow numbers and one decimal point
                    if (!/^\d*\.?\d*$/.test(inputValue)) {
                      return;
                    }
                    
                    // Check if input has more than 2 decimal places
                    const decimalIndex = inputValue.indexOf('.');
                    if (decimalIndex !== -1 && inputValue.length - decimalIndex - 1 > 2) {
                      // Don't update if more than 2 decimal places
                      return;
                    }
                    
                    const value = parseFloat(inputValue) || 0;
                    handleInputChange('currentPrice', Math.max(0, value)); // Prevent negative values
                  }}
                  placeholder={
                    formData.category === 'stocks' || formData.category === 'etfs' || formData.category === 'crypto' 
                      ? "Click 'Lookup' to fetch current price"
                      : "Enter price manually"
                  }
                  className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formData.category === 'stocks' || formData.category === 'etfs' || formData.category === 'crypto'
                      ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
              {errors.currentPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPrice}</p>
              )}
            </div>
          )}

          {/* Quantity - Only show for stocks, ETFs, and crypto */}
          {!isSimplifiedCategory(formData.category) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={quantityDisplay}
                    onChange={(e) => {
                      const inputValue = e.target.value.trim();
                      
                      // Allow empty input
                      if (inputValue === '') {
                        setQuantityDisplay('');
                        handleInputChange('quantity', 0);
                        return;
                      }
                      
                      // Only allow numbers and one decimal point
                      if (!/^\d*\.?\d*$/.test(inputValue)) {
                        return;
                      }
                      
                      // Check if input has more than 6 decimal places
                      const decimalIndex = inputValue.indexOf('.');
                      if (decimalIndex !== -1 && inputValue.length - decimalIndex - 1 > 6) {
                        // Don't update if more than 6 decimal places
                        return;
                      }
                      
                      setQuantityDisplay(inputValue);
                      const value = parseFloat(inputValue) || 0;
                      handleInputChange('quantity', Math.max(0, value)); // Prevent negative values
                    }}
                    placeholder="0"
                    className={`w-full px-3 pr-20 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex">
                    <button
                      type="button"
                      onClick={() => {
                        const newQuantity = Math.max(0, formData.quantity - 1);
                        setQuantityDisplay(newQuantity.toString());
                        handleInputChange('quantity', newQuantity);
                      }}
                      className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Remove className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newQuantity = formData.quantity + 1;
                        setQuantityDisplay(newQuantity.toString());
                        handleInputChange('quantity', newQuantity);
                      }}
                      className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors rounded-r-lg"
                    >
                      <Add className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
          )}

          {/* Current Holding Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Holding Value
            </label>
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10">
                  $
                </span>
                <input
                  type="text"
                  value={holdingValueDisplay}
                  onChange={(e) => {
                    const inputValue = e.target.value.trim();
                    
                    // Allow empty input
                    if (inputValue === '') {
                      setHoldingValueDisplay('');
                      handleInputChange('holdingValue', 0);
                      return;
                    }
                    
                    // Only allow numbers and one decimal point
                    if (!/^\d*\.?\d*$/.test(inputValue)) {
                      return;
                    }
                    
                    // Check if input has more than 2 decimal places
                    const decimalIndex = inputValue.indexOf('.');
                    if (decimalIndex !== -1 && inputValue.length - decimalIndex - 1 > 2) {
                      // Don't update if more than 2 decimal places
                      return;
                    }
                    
                    setHoldingValueDisplay(inputValue);
                    const value = parseFloat(inputValue) || 0;
                    handleInputChange('holdingValue', Math.max(0, value)); // Prevent negative values
                  }}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-20 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.holdingValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex">
                  <button
                    type="button"
                    onClick={() => {
                      const newHoldingValue = Math.max(0, (formData.holdingValue || 0) - 100);
                      setHoldingValueDisplay(newHoldingValue.toFixed(2));
                      handleInputChange('holdingValue', newHoldingValue);
                    }}
                    className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Remove className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newHoldingValue = (formData.holdingValue || 0) + 100;
                      setHoldingValueDisplay(newHoldingValue.toFixed(2));
                      handleInputChange('holdingValue', newHoldingValue);
                    }}
                    className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors rounded-r-lg"
                  >
                    <Add className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            {errors.holdingValue && (
              <p className="text-red-500 text-sm mt-1">{errors.holdingValue}</p>
            )}
          </div>


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
              disabled={loading || !isFormValid()}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                loading || !isFormValid()
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
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