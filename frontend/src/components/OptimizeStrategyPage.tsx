import React from 'react';
import { Header } from './Header';
import { SignupCTA } from './SignupCTA';
import { Target, Zap, BarChart3, TrendingUp, Settings, ArrowRight } from 'lucide-react';

interface OptimizeStrategyPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function OptimizeStrategyPage({ isDark, onThemeToggle }: OptimizeStrategyPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-800/30 rounded-2xl flex items-center justify-center">
              <Target className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Optimize Your Portfolio
              <span className="text-green-600 dark:text-green-400 block">
                With AI Precision
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our AI analyzes thousands of portfolio combinations to find the optimal allocation 
              for your risk tolerance and financial goals. Get optimization in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How AI Optimization Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Professional portfolio optimization made simple
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center">
                <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Analyze Current Portfolio
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI examines your current allocation, risk metrics, and correlation patterns to understand your starting point.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-purple-100 dark:bg-purple-800/30 rounded-full flex items-center justify-center">
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Test Thousands of Scenarios
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced algorithms test thousands of asset allocation combinations to find the optimal mix for your goals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Deliver Optimal Strategy
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get a personalized reallocation plan that maximizes returns while respecting your risk tolerance.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Multiple Objectives
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Optimize for maximum return, minimum risk, best Sharpe ratio, or income generation.
              </p>
            </div>
    
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Implementation Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Get step-by-step instructions for rebalancing, including specific buy/sell recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signup CTA */}
      <SignupCTA 
        featureName="AI Portfolio Optimization"
        description="Let our AI find the perfect asset allocation to maximize your returns while managing risk."
      />

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>Important:</strong> This is a demonstration tool for educational purposes. Always consult with qualified financial advisors before making investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}