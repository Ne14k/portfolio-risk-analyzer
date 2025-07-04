import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PlaidConnect } from './PlaidConnect';
import { ConnectedAccounts } from './ConnectedAccounts';
import { PortfolioHoldings } from './PortfolioHoldings';
import { useAuth } from '../contexts/AuthContext';
import { getConnectedAccounts, getPortfolioHoldings, getPortfolioSummary, getMockPortfolioData } from '../services/plaid';
import { ConnectedAccount, PortfolioHolding, PortfolioSummary } from '../types/plaid';
import { FileBarChart, Link as LinkIcon, Shield, CheckCircle, BarChart3, Users, ArrowRight } from 'lucide-react';

interface ImportPortfolioPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function ImportPortfolioPage({ isDark, onThemeToggle }: ImportPortfolioPageProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showPlaidConnect, setShowPlaidConnect] = useState(false);
  
  // Plaid data state
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'holdings'>('accounts');

  // Set page title
  useEffect(() => {
    document.title = 'MyPortfolioTracker - Import Portfolio';
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load portfolio data when user is authenticated
  useEffect(() => {
    if (user?.id) {
      loadPortfolioData();
    }
  }, [user?.id]);

  // Load portfolio data from API (with fallback to mock data)
  const loadPortfolioData = async () => {
    if (!user?.id) return;
    
    setDataLoading(true);
    try {
      // For demo purposes, use mock data since backend isn't implemented yet
      const mockData = getMockPortfolioData();
      setConnectedAccounts(mockData.accounts);
      setPortfolioHoldings(mockData.holdings);
      setPortfolioSummary(mockData.summary);
      setHasConnectedAccounts(mockData.accounts.length > 0);

      /* 
      // Real API calls (uncomment when backend is ready):
      const [accounts, holdings, summary] = await Promise.all([
        getConnectedAccounts(user.id),
        getPortfolioHoldings(user.id),
        getPortfolioSummary(user.id)
      ]);
      setConnectedAccounts(accounts);
      setPortfolioHoldings(holdings);
      setPortfolioSummary(summary);
      setHasConnectedAccounts(accounts.length > 0);
      */
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      // Fallback to empty state
      setConnectedAccounts([]);
      setPortfolioHoldings([]);
      setPortfolioSummary(null);
      setHasConnectedAccounts(false);
    } finally {
      setDataLoading(false);
    }
  };

  // Handle successful Plaid connection
  const handlePlaidSuccess = (institutionName: string) => {
    alert(`Successfully connected to ${institutionName}! Your portfolio data will be imported shortly.`);
    setShowPlaidConnect(false);
    loadPortfolioData();
  };

  // Handle Plaid errors
  const handlePlaidError = (error: string) => {
    console.error('Plaid error:', error);
  };

  // Handle account removal
  const handleAccountRemoved = (accountId: string) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    setPortfolioHoldings(prev => prev.filter(holding => holding.account_id !== accountId));
    loadPortfolioData(); // Refresh data
  };

  // Navigate to portfolio analysis
  const handleAnalyzePortfolio = () => {
    navigate('/demo');
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800/30 rounded-2xl flex items-center justify-center">
            <FileBarChart className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio Import & Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect your brokerage accounts securely and manage your portfolio data.
          </p>
        </div>

        {hasConnectedAccounts ? (
          /* Portfolio Management View */
          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('accounts')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'accounts'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Accounts ({connectedAccounts.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('holdings')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'holdings'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Holdings ({portfolioHoldings.length})</span>
                  </div>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPlaidConnect(true)}
                  className="px-4 py-2 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors font-medium"
                >
                  Connect More Accounts
                </button>
                <button
                  onClick={handleAnalyzePortfolio}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                >
                  <span>Analyze Portfolio</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'accounts' ? (
              <ConnectedAccounts
                accounts={connectedAccounts}
                loading={dataLoading}
                onRefresh={loadPortfolioData}
                onAccountRemoved={handleAccountRemoved}
              />
            ) : (
              portfolioSummary && (
                <PortfolioHoldings
                  holdings={portfolioHoldings}
                  summary={portfolioSummary}
                  loading={dataLoading}
                />
              )
            )}
          </div>
        ) : !showPlaidConnect ? (
          /* Welcome/Get Started View */
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                <LinkIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Get Started with Portfolio Analysis
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Connect your brokerage accounts securely using Plaid to automatically import your portfolio data and start analyzing your investments.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Support for 12,000+ financial institutions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Bank-level security with read-only access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Automatic portfolio data synchronization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Comprehensive risk analysis and optimization</span>
                </div>
              </div>

              <button
                onClick={() => setShowPlaidConnect(true)}
                className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-3"
              >
                <LinkIcon className="h-5 w-5" />
                <span>Connect Your Brokerage Account</span>
              </button>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm text-left">
                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                      Your data is only displayed for analysis - never stored
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      We use Plaid's secure infrastructure with read-only access and 256-bit encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Plaid Connection */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <PlaidConnect 
                onSuccess={handlePlaidSuccess}
                onError={handlePlaidError}
              />
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPlaidConnect(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}