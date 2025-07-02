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

      {/* Before/After Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              See the Difference Optimization Makes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real example of portfolio improvement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Before */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
              <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-6 text-center">
                Before Optimization
              </h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Expected Return</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">6.2%</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Risk (Volatility)</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">18.5%</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Sharpe Ratio</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">0.28</span>
                  </div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6 text-center">
                After Optimization
              </h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Expected Return</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">8.1%</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Risk (Volatility)</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">15.2%</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Sharpe Ratio</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">0.47</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 inline-block">
              <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                <ArrowRight className="h-5 w-5" />
                <span className="font-semibold">Result: 30% higher returns with 18% less risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
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
              <Target className="h-8 w-8 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Constraint Aware
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Respects your constraints: risk tolerance, sector limits, ESG preferences, and tax efficiency.
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