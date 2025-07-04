import React, { useState } from 'react';
import { 
  Building2, 
  RefreshCw, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar
} from 'lucide-react';
import { ConnectedAccount } from '../types/plaid';
import { formatCurrency, refreshAccountData, disconnectAccount } from '../services/plaid';

interface ConnectedAccountsProps {
  accounts: ConnectedAccount[];
  loading?: boolean;
  onRefresh: () => void;
  onAccountRemoved: (accountId: string) => void;
}

export function ConnectedAccounts({ 
  accounts, 
  loading = false, 
  onRefresh, 
  onAccountRemoved 
}: ConnectedAccountsProps) {
  const [refreshingAccounts, setRefreshingAccounts] = useState<Set<string>>(new Set());
  const [removingAccounts, setRemovingAccounts] = useState<Set<string>>(new Set());
  const [hiddenBalances, setHiddenBalances] = useState<Set<string>>(new Set());

  // Handle refresh individual account
  const handleRefreshAccount = async (accountId: string, userId: string) => {
    setRefreshingAccounts(prev => new Set(prev).add(accountId));
    
    try {
      await refreshAccountData(userId, accountId);
      onRefresh();
    } catch (error) {
      console.error('Failed to refresh account:', error);
      // Show error toast or notification
    } finally {
      setRefreshingAccounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }
  };

  // Handle disconnect account
  const handleDisconnectAccount = async (accountId: string, userId: string) => {
    if (!window.confirm('Are you sure you want to disconnect this account? This will remove all associated data.')) {
      return;
    }

    setRemovingAccounts(prev => new Set(prev).add(accountId));
    
    try {
      await disconnectAccount(userId, accountId);
      onAccountRemoved(accountId);
    } catch (error) {
      console.error('Failed to disconnect account:', error);
      // Show error toast or notification
    } finally {
      setRemovingAccounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }
  };

  // Toggle balance visibility
  const toggleBalanceVisibility = (accountId: string) => {
    setHiddenBalances(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  // Get account type badge color
  const getAccountTypeBadge = (type: string, subtype: string) => {
    const typeKey = `${type}_${subtype}`.toLowerCase();
    
    const badges: Record<string, string> = {
      'investment_brokerage': 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300',
      'investment_401k': 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300',
      'investment_ira': 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300',
      'investment_roth': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/20 dark:text-indigo-300',
      'investment_401a': 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-300',
      'investment_403b': 'bg-teal-100 text-teal-800 dark:bg-teal-800/20 dark:text-teal-300',
    };

    return badges[typeKey] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Connected Accounts
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your brokerage accounts to view your portfolio data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Connected Accounts ({accounts.length})
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh All</span>
        </button>
      </div>

      <div className="grid gap-4">
        {accounts.map((account) => {
          const isRefreshing = refreshingAccounts.has(account.id);
          const isRemoving = removingAccounts.has(account.id);
          const isBalanceHidden = hiddenBalances.has(account.id);
          
          return (
            <div
              key={account.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                isRemoving ? 'opacity-50' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Institution Icon */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: account.institution.primary_color || '#6B7280' }}
                  >
                    {account.institution.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Account Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {account.official_name || account.name}
                      </h3>
                      <span 
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getAccountTypeBadge(account.type, account.subtype)}`}
                      >
                        {account.subtype.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span>{account.institution.name}</span>
                      <span>•••{account.mask}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {new Date(account.last_updated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {isBalanceHidden ? '••••••' : formatCurrency(account.balance, account.currency)}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleBalanceVisibility(account.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {isBalanceHidden ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRefreshAccount(account.id, account.account_id)}
                    disabled={isRefreshing || isRemoving}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                    title="Refresh account data"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => handleDisconnectAccount(account.id, account.account_id)}
                    disabled={isRefreshing || isRemoving}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Disconnect account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Connected</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Last synced: {new Date(account.last_updated).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
              Your data is secure
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              We use bank-level security and read-only access. Your login credentials are never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}