import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { FileBarChart, ArrowRight, BarChart3, PieChart, TrendingUp, Shield, CheckCircle, Plus, Sliders, Eye } from 'lucide-react';

interface ImportPortfolioPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function ImportPortfolioPage({ isDark, onThemeToggle }: ImportPortfolioPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Set page title
  useEffect(() => {
    document.title = 'MyPortfolioTracker - Dashboard Preview';
  }, []);

  // If user is authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-800/30 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Build & Track Your
              <span className="text-green-600 dark:text-green-400 block">
                Investment Portfolio
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Take control of your investments with our intuitive portfolio dashboard. 
              Manually input your holdings, track performance, and analyze risk - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Building Your Portfolio
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Personal Investment Dashboard
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage and analyze your portfolio, designed for simplicity and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-800/30 rounded-xl flex items-center justify-center">
                <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Manual Input</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add your holdings manually with our intuitive forms. Enter stocks, ETFs, bonds, and more with ease.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800/30 rounded-xl flex items-center justify-center">
                <Sliders className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Asset Allocation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use interactive sliders to set your target allocation across stocks, bonds, real estate, and more.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-800/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Performance Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track gains, losses, and overall portfolio performance with beautiful charts and analytics.
              </p>
            </div>
          </div>

          {/* Mock Dashboard Preview */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Preview</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Eye className="h-4 w-4" />
                <span>Demo View</span>
              </div>
            </div>
            
            {/* Mock Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">$••••••</p>
                  </div>
                  <PieChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Gain/Loss</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">+$••••••</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Return %</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">+•••%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Holdings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">••</p>
                  </div>
                  <FileBarChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sign up to access your personal dashboard and start building your portfolio
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Privacy First</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your financial data stays with you. We believe in complete transparency and user control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Data Collection
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your portfolio data is stored locally in your browser. We never see or store your financial information.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Complete Control
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Export your data anytime, delete it when you want. You own your information completely.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Open Source
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our code is transparent and auditable. See exactly how your data is handled.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Account Required
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Start tracking immediately. Create an account only when you want to save your work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}