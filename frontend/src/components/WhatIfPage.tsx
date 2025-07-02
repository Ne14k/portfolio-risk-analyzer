import React from 'react';
import { Header } from './Header';
import { SignupCTA } from './SignupCTA';
import { DollarSign, TrendingUp, Calendar, BarChart3, Zap, ArrowRight } from 'lucide-react';

interface WhatIfPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function WhatIfPage({ isDark, onThemeToggle }: WhatIfPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 dark:bg-yellow-800/30 rounded-2xl flex items-center justify-center">
              <DollarSign className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              What If I Invested In...
              <span className="text-yellow-600 dark:text-yellow-400 block">
                Apple? Bitcoin? S&P 500?
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Build custom investment scenarios and see exactly how different strategies would have performed. 
              Compare any combination of stocks, ETFs, crypto, and more over any time period.
            </p>
          </div>
        </div>
      </section>

      {/* Scenario Examples Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Popular "What If" Scenarios
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See how these strategies would have performed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  $10K in Apple (2010)
                </h3>
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">$1.7M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Value today</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Annual Return</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">42.8%</div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  $10K in S&P 500 (2010)
                </h3>
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$43K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Value today</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Annual Return</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">11.2%</div>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  $10K in Bitcoin (2017)
                </h3>
                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">$27K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Value today</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Annual Return</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">15.1%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Builder Features */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-xl">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Build Any Scenario
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Mix and match any investments to create custom scenarios. Compare different strategies, 
                test timing decisions, and see how different allocations would have performed.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">50,000+ stocks, ETFs, and cryptocurrencies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Historical data going back 30+ years</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Account for dividends, splits, and fees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Dollar-cost averaging and lump sum strategies</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Scenario Builder</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Tesla (TSLA)</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">40%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">VTI (Total Stock)</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">40%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Bitcoin</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">20%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Time Period:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">2018-2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Features */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Advanced Comparison Tools
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Time Period Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                See how the same strategy performs across different time periods. Bull markets vs bear markets.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Risk-Adjusted Returns
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Compare not just returns, but risk-adjusted performance using Sharpe ratios and volatility.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-800/30 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Drawdown Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Understand maximum losses and recovery times for each strategy you test.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Comparison */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Example: Tech Stocks vs Index Funds
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              $100/month invested from 2015-2024
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4">
                FAANG Stocks (50/50/20/20/10)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Total Invested</span>
                  <span className="font-semibold text-gray-900 dark:text-white">$10,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Final Value</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">$28,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Annual Return</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">17.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Max Drawdown</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">-35%</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4">
                S&P 500 Index (VTI)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Total Invested</span>
                  <span className="font-semibold text-gray-900 dark:text-white">$10,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Final Value</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">$19,240</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Annual Return</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">10.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Max Drawdown</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">-19%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup CTA */}
      <SignupCTA 
        featureName="Scenario Builder"
        description="Build unlimited 'what if' scenarios and discover how different investment strategies would have performed."
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