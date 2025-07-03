import axios from 'axios';
import { PortfolioInput, OptimizationResult, AssetClass } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.myportfoliotracker.xyz';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Reduced from 30s to 15s for better UX
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache for API responses to prevent duplicate requests
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map<string, Promise<any>>();

// Add response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Don't retry if we've already retried or if it's a client error
    if (config._retry || (error.response && error.response.status < 500)) {
      return Promise.reject(error);
    }
    
    // Only retry on network errors or 5xx server errors
    if (error.code === 'ECONNABORTED' || 
        error.code === 'NETWORK_ERROR' ||
        !error.response ||
        (error.response.status >= 500)) {
      
      config._retry = true;
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

export const analyzePortfolio = async (portfolio: PortfolioInput): Promise<OptimizationResult> => {
  const cacheKey = `analyze_${JSON.stringify(portfolio)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached portfolio analysis result');
    return cached.data;
  }
  
  // Check if the same request is already pending to prevent duplicates
  if (pendingRequests.has(cacheKey)) {
    console.log('Returning pending portfolio analysis request');
    return pendingRequests.get(cacheKey)!;
  }
  
  const requestPromise = (async () => {
    try {
      console.log('Sending portfolio analysis request:', portfolio);
      const response = await api.post<OptimizationResult>('/analyze', portfolio);
      console.log('Portfolio analysis response:', response.data);
      
      // Cache the result
      cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      
      return response.data;
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      throw new Error(
        error instanceof Error 
          ? `Analysis failed: ${error.message}` 
          : 'Portfolio analysis failed. Please try again.'
      );
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey);
    }
  })();
  
  // Store the pending request
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
};

export const getAssetClasses = async (): Promise<{ asset_classes: AssetClass[] }> => {
  try {
    const response = await api.get<{ asset_classes: AssetClass[] }>('/asset-classes');
    return response.data;
  } catch (error) {
    console.error('Asset classes fetch error:', error);
    // Return fallback data if API fails
    return {
      asset_classes: [
        { name: 'stocks', display_name: 'Stocks', expected_return: 10, volatility: 16, description: 'Equity investments' },
        { name: 'bonds', display_name: 'Bonds', expected_return: 4, volatility: 4, description: 'Fixed income' },
        { name: 'alternatives', display_name: 'Alternatives', expected_return: 8, volatility: 12, description: 'Alternative investments' },
        { name: 'cash', display_name: 'Cash', expected_return: 2, volatility: 1, description: 'Cash and equivalents' }
      ]
    };
  }
};