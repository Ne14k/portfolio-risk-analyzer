import React from 'react';
import { Header } from './Header';
import { SignupCTA } from './SignupCTA';
import { TrendingUp, BarChart3, Target, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface ForecastPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function ForecastPage({ isDark, onThemeToggle }: ForecastPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-800/30 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Forecast Your Portfolio's
              <span className="text-blue-600 dark:text-blue-400 block">
                Future Performance
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Run thousands of Monte Carlo simulations to see how your portfolio might perform over time. 
              Understand your chances of reaching your financial goals.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                10,000 Simulations
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Run thousands of different market scenarios to see the full range of possible outcomes for your portfolio.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-800/30 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Goal Probability
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                See your actual chances of reaching retirement goals, buying a house, or any financial target.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-800/30 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Timeline Flexibility
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Forecast anywhere from 1 year to 40+ years. See how time horizon affects your success probability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              See Your Portfolio's Potential Paths
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Visualize thousands of possible futures for your investments
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">Best Case (90th percentile)</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-bold">$1.2M</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">Most Likely (50th percentile)</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">$650K</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">Worst Case (10th percentile)</span>
                  </div>
                  <span className="text-red-600 dark:text-red-400 font-bold">$420K</span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Success Probability</h3>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">73%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chance of reaching your $600K retirement goal in 20 years
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Signup CTA */}
      <SignupCTA 
        featureName="Portfolio Forecasting"
        description="Run advanced Monte Carlo simulations to see all possible futures for your investments."
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