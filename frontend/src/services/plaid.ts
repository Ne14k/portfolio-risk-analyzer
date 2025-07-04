import axios from 'axios';
import { 
  PlaidLinkTokenResponse, 
  PlaidAccessTokenResponse, 
  ConnectedAccount, 
  PortfolioHolding, 
  PortfolioSummary 
} from '../types/plaid';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.myportfoliotracker.xyz';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Create a link token for Plaid Link initialization
 */
export const createLinkToken = async (userId: string): Promise<PlaidLinkTokenResponse> => {
  try {
    const response = await api.post<PlaidLinkTokenResponse>('/plaid/create-link-token', {
      user_id: userId,
      client_name: 'MyPortfolioTracker',
      country_codes: ['US'],
      language: 'en',
      products: ['investments'],
    });
    return response.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw new Error('Failed to create link token');
  }
};

/**
 * Exchange public token for access token
 */
export const exchangePublicToken = async (
  publicToken: string,
  userId: string
): Promise<PlaidAccessTokenResponse> => {
  try {
    const response = await api.post<PlaidAccessTokenResponse>('/plaid/exchange-public-token', {
      public_token: publicToken,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw new Error('Failed to exchange public token');
  }
};

/**
 * Fetch connected accounts for a user
 */
export const getConnectedAccounts = async (userId: string): Promise<ConnectedAccount[]> => {
  try {
    const response = await api.get<{ accounts: ConnectedAccount[] }>(`/plaid/accounts/${userId}`);
    return response.data.accounts;
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    throw new Error('Failed to fetch connected accounts');
  }
};

/**
 * Fetch portfolio holdings for a user
 */
export const getPortfolioHoldings = async (userId: string): Promise<PortfolioHolding[]> => {
  try {
    const response = await api.get<{ holdings: PortfolioHolding[] }>(`/plaid/holdings/${userId}`);
    return response.data.holdings;
  } catch (error) {
    console.error('Error fetching portfolio holdings:', error);
    throw new Error('Failed to fetch portfolio holdings');
  }
};

/**
 * Get portfolio summary and analytics
 */
export const getPortfolioSummary = async (userId: string): Promise<PortfolioSummary> => {
  try {
    const response = await api.get<PortfolioSummary>(`/plaid/portfolio-summary/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    throw new Error('Failed to fetch portfolio summary');
  }
};

/**
 * Refresh account data from Plaid
 */
export const refreshAccountData = async (userId: string, accountId?: string): Promise<void> => {
  try {
    await api.post('/plaid/refresh', {
      user_id: userId,
      account_id: accountId,
    });
  } catch (error) {
    console.error('Error refreshing account data:', error);
    throw new Error('Failed to refresh account data');
  }
};

/**
 * Disconnect a Plaid account
 */
export const disconnectAccount = async (userId: string, accountId: string): Promise<void> => {
  try {
    await api.delete(`/plaid/accounts/${userId}/${accountId}`);
  } catch (error) {
    console.error('Error disconnecting account:', error);
    throw new Error('Failed to disconnect account');
  }
};

/**
 * Calculate asset allocation from holdings
 */
export const calculateAssetAllocation = (holdings: PortfolioHolding[]) => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.market_value, 0);
  
  if (totalValue === 0) {
    return { stocks: 0, bonds: 0, cash: 0, alternatives: 0 };
  }

  let stocks = 0;
  let bonds = 0;
  let cash = 0;
  let alternatives = 0;

  holdings.forEach(holding => {
    const percentage = holding.market_value / totalValue;
    const securityType = holding.security.type?.toLowerCase() || '';
    
    if (securityType.includes('equity') || securityType.includes('stock')) {
      stocks += percentage;
    } else if (securityType.includes('bond') || securityType.includes('fixed income')) {
      bonds += percentage;
    } else if (securityType.includes('cash') || securityType.includes('money market')) {
      cash += percentage;
    } else {
      alternatives += percentage;
    }
  });

  return {
    stocks: Math.round(stocks * 100) / 100,
    bonds: Math.round(bonds * 100) / 100,
    cash: Math.round(cash * 100) / 100,
    alternatives: Math.round(alternatives * 100) / 100,
  };
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Get gain/loss color class for UI
 */
export const getGainLossColor = (value: number): string => {
  if (value > 0) return 'text-green-600 dark:text-green-400';
  if (value < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
};

/**
 * Mock data for development (remove in production)
 */
export const getMockPortfolioData = () => {
  return {
    accounts: [] as ConnectedAccount[],
    holdings: [] as PortfolioHolding[],
    summary: {
      total_value: 0,
      total_gain_loss: 0,
      total_gain_loss_percentage: 0,
      accounts_count: 0,
      holdings_count: 0,
      asset_allocation: {
        stocks: 0,
        bonds: 0,
        cash: 0,
        alternatives: 0,
      },
      last_updated: new Date().toISOString(),
    } as PortfolioSummary,
  };
};