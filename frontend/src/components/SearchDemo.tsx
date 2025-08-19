import React, { useState } from 'react';
import { StockSearch } from './StockSearch';
import { getStockQuote, finnhubService } from '../services/finnhub';
import type { StockQuote } from '../services/finnhub';

export function SearchDemo() {
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStockSelect = async (stock: { symbol: string; name: string }) => {
    setSelectedStock(stock);
    setLoading(true);
    
    try {
      const stockQuote = await getStockQuote(stock.symbol);
      setQuote(stockQuote);
    } catch (error) {
      console.error('Error getting quote:', error);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const apiStatus = finnhubService.getApiStatus();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Search Stocks, ETFs & Crypto
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Try searching for: AAPL, VTI, SPY, BTC, ETH, TSLA
        </p>
        {apiStatus.configured && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            ✅ Finnhub API connected
          </p>
        )}
      </div>

      <StockSearch onSelect={handleStockSelect} />

      {selectedStock && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Selected: {selectedStock.symbol}
          </h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading quote...</p>
            </div>
          ) : quote ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{quote.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Symbol</p>
                  <p className="font-medium text-gray-900 dark:text-white">{quote.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${quote.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
                  <p className={`font-medium ${
                    quote.change >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(quote.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Could not fetch quote for {selectedStock.symbol}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchDemo;