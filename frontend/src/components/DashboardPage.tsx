import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { HoldingForm } from './HoldingForm';
import { AssetAllocationChart } from './AssetAllocationChart';
import { PortfolioForecast } from './PortfolioForecast';
import { useAuth } from '../contexts/AuthContext';
import { PortfolioService } from '../services/portfolio';
import { Portfolio, PortfolioSummary } from '../types/portfolio';
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  Sliders,
  Calendar
} from 'lucide-react';

interface DashboardPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function DashboardPage({ isDark, onThemeToggle }: DashboardPageProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [editingHolding, setEditingHolding] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'allocation' | 'forecast'>('holdings');

  // Set page title
  useEffect(() => {
    document.title = 'MyPortfolioTracker - Dashboard';
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load portfolio data and start auto-updates
  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading portfolio data...');
      console.log('User details:', {
        id: user.id,
        email: user.email,
      });
      
      
      loadPortfolioData();
      // Start automatic price updates every 60 minutes
      PortfolioService.startAutoUpdates();
    }
    
    // Cleanup interval on unmount
    return () => {
      PortfolioService.stopAutoUpdates();
    };
  }, [user]);

  const loadPortfolioData = async () => {
    try {
      const portfolioData = await PortfolioService.loadPortfolio() || PortfolioService.createEmptyPortfolio();
      const summaryData = await PortfolioService.getPortfolioSummary();
      
      setPortfolio(portfolioData);
      setSummary(summaryData || {
        totalValue: portfolioData.totalValue,
        totalGainLoss: 0,
        totalGainLossPercentage: 0,
        holdingsCount: portfolioData.holdings.length,
        assetAllocation: portfolioData.assetAllocation,
        topHoldings: portfolioData.holdings.slice(0, 5),
        lastUpdated: portfolioData.lastUpdated
      });
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      // Fallback to empty portfolio
      const emptyPortfolio = PortfolioService.createEmptyPortfolio();
      setPortfolio(emptyPortfolio);
      setSummary({
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercentage: 0,
        holdingsCount: 0,
        assetAllocation: emptyPortfolio.assetAllocation,
        topHoldings: [],
        lastUpdated: new Date().toISOString()
      });
    }
  };

  // Auto-refresh component when localStorage changes (for auto-updates)
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        loadPortfolioData();
      }
    };

    // Listen for manual updates to localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Also set up polling to catch programmatic updates
    const pollInterval = setInterval(() => {
      if (user) {
        loadPortfolioData();
      }
    }, 10000); // Check every 10 seconds for UI updates

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [user]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getGainLossColor = (value: number): string => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const handleDeleteHolding = async (holdingId: string) => {
    if (window.confirm('Are you sure you want to delete this holding?')) {
      const success = await PortfolioService.removeHolding(holdingId);
      if (success) {
        loadPortfolioData();
      }
    }
  };

  const exportPortfolio = () => {
    if (!portfolio) return;
    
    const dataStr = JSON.stringify(portfolio, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearPortfolio = async () => {
    if (window.confirm('Are you sure you want to clear all portfolio data? This cannot be undone.')) {
      const success = await PortfolioService.clearPortfolio();
      if (success) {
        loadPortfolioData();
      }
    }
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

  if (!portfolio || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Portfolio Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Welcome back, {user.full_name || user.email?.split('@')[0]}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddHolding(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Holding</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value (CAD)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.totalValue)}
                </p>
                {portfolio && portfolio.holdings.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Auto-updates every 60 min
                  </p>
                )}
              </div>
              <PieChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Holdings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.holdingsCount}
                </p>
                {portfolio && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Updated: {new Date(portfolio.lastUpdated).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
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
                <span>Holdings ({portfolio.holdings.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('allocation')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'allocation'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sliders className="h-4 w-4" />
                <span>Asset Allocation</span>
              </div>
            </button>
          </div>

          {portfolio.holdings.length > 0 && (
            <button
              onClick={clearPortfolio}
              className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
            >
              Clear Portfolio
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'holdings' ? (
          /* Holdings List */
          portfolio.holdings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Holdings Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start building your portfolio by adding your first holding
              </p>
              <button
                onClick={() => setShowAddHolding(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Holding</span>
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Security
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price (CAD)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Market Value (per share)
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {portfolio.holdings.map((holding) => (
                      <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {holding.ticker}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {holding.name}
                            </div>
                            <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded mt-1">
                              {holding.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                          {holding.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(holding.quantity * holding.currentPrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(holding.currentPrice)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setEditingHolding(holding.id)}
                              className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Edit holding"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteHolding(holding.id)}
                              className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete holding"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Asset Allocation Tab */
          <AssetAllocationChart 
            allocation={summary.assetAllocation}
            title="Current Asset Allocation"
          />
        )}
        
      </div>

      <Footer />

      {/* Add/Edit Holding Modal */}
      {(showAddHolding || editingHolding) && (
        <HoldingForm
          editingHoldingId={editingHolding || undefined}
          onClose={() => {
            setShowAddHolding(false);
            setEditingHolding(null);
          }}
          onSave={loadPortfolioData}
        />
      )}
    </div>
  );
}