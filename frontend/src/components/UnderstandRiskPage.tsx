import React from 'react';
import { Header } from './Header';
import { SignupCTA } from './SignupCTA';
import { Brain, BookOpen, MessageSquare, Lightbulb, HelpCircle, CheckCircle } from 'lucide-react';

interface UnderstandRiskPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function UnderstandRiskPage({ isDark, onThemeToggle }: UnderstandRiskPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 dark:bg-purple-800/30 rounded-2xl flex items-center justify-center">
              <Brain className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Finally Understand
              <span className="text-purple-600 dark:text-purple-400 block">
                Your Investment Risk
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our AI explains complex financial concepts in plain English. No more confusing jargon—
              just clear, personalized explanations about your portfolio's risk and performance.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Risk Translator
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Ask our AI anything about your portfolio. "Why is my Sharpe ratio low?" 
                "What does volatility mean for me?" Get instant, personalized explanations.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Explains Sharpe ratio, beta, volatility in simple terms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Contextualizes metrics for your specific situation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Suggests actionable improvements</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-start space-x-3 mb-4">
                  <HelpCircle className="h-5 w-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You asked:</p>
                    <p className="text-gray-900 dark:text-white">"Why is my portfolio so volatile?"</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-purple-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">AI explains:</p>
                    <p className="text-gray-900 dark:text-white text-sm">
                      "Your portfolio is 85% stocks with heavy tech concentration. This means when tech stocks swing up or down, your whole portfolio follows. Consider adding bonds or diversifying across sectors to smooth out the ride."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Topics Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Learn Investment Concepts That Actually Matter
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get personalized education based on your actual portfolio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 mb-4 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Risk Metrics Explained
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Understand what Sharpe ratio, beta, and standard deviation mean for your specific portfolio.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 mb-4 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Diversification 101
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Learn why diversification matters and how to tell if your portfolio is actually diversified.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 mb-4 bg-orange-100 dark:bg-orange-800/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Risk vs Return
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Understand the fundamental trade-off and how to find the right balance for your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signup CTA */}
      <SignupCTA 
        featureName="AI Risk Education"
        description="Get personalized explanations of your portfolio's risk metrics in language you can understand."
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