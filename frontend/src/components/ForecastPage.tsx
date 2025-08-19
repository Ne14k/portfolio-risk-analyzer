import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PortfolioForecast } from './PortfolioForecast';
import { SignupCTA } from './SignupCTA';
import { useAuth } from '../contexts/AuthContext';
import { PortfolioService } from '../services/portfolio';
import { Portfolio } from '../types/portfolio';
import { TrendingUp, BarChart3, Target, TrendingDown, DollarSign, Calendar, Loader2 } from 'lucide-react';

interface ForecastPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function ForecastPage({ isDark, onThemeToggle }: ForecastPageProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = 'MyPortfolioTracker - Portfolio Forecast';
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load portfolio data
  useEffect(() => {
    if (user) {
      loadPortfolioData();
    }
  }, [user]);

  const loadPortfolioData = async () => {
    setPortfolioLoading(true);
    try {
      const portfolioData = await PortfolioService.loadPortfolio() || PortfolioService.createEmptyPortfolio();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      const emptyPortfolio = PortfolioService.createEmptyPortfolio();
      setPortfolio(emptyPortfolio);
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Show loading while checking auth
  if (loading || portfolioLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Portfolio Forecasting
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Analyze your portfolio's potential future performance using Monte Carlo simulations
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Forecast Component */}
        {portfolio && (
          <PortfolioForecast portfolio={portfolio} />
        )}
      </div>

      <Footer />
    </div>
  );
}