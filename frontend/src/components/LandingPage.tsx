import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Target, Users, ArrowRight, CheckCircle, DollarSign } from 'lucide-react';
import { Header } from './Header';

interface LandingPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function LandingPage({ isDark, onThemeToggle }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />

      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Stop Worrying About Your
              <span className="text-green-600 dark:text-green-400 block">
                Investment Portfolio
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              You work hard for your money. Now let's make sure your money works just as hard for you. 
              Get clear, honest insights about your portfolio's risk and performance in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/demo"
                className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Try Portfolio Risk Analyzer Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Are You Making These Common Investment Mistakes?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">
                "I think my portfolio is diversified, but I'm not sure..."
              </h3>
              <p className="text-red-700 dark:text-red-300">
                Many investors think they're diversified because they own different stocks, 
                but they're actually concentrated in similar sectors or risk profiles.
              </p>
            </div>
            <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200 mb-3">
                "I don't know if I'm taking too much risk"
              </h3>
              <p className="text-orange-700 dark:text-orange-300">
                Without proper analysis, you might be taking unnecessary risks that could 
                wipe out years of gains, or playing it too safe and missing growth opportunities.
              </p>
            </div>
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                "Financial advisors are too expensive"
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                Professional portfolio analysis can cost thousands of dollars, making it 
                inaccessible for regular investors who just want basic insights.
              </p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-3">
                "I don't understand the financial jargon"
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Sharpe ratios, volatility, correlation coefficients - the investment world 
                speaks in a language that feels designed to confuse everyday investors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Finally, Portfolio Analysis That Makes Sense
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              MyPortfolio gives you portfolio analysis in plain English.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Know Your Real Risk
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                See exactly how risky your portfolio really is, explained in terms you actually understand. 
                No confusing charts or financial mumbo-jumbo.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Get Better Balance
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Discover if you're actually diversified or just think you are. Get specific suggestions 
                for improving your portfolio's balance.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-800/30 rounded-full flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Maximize Your Returns
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Find out if you're leaving money on the table. Get personalized recommendations 
                to optimize your risk-return balance.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Final CTA Section */}
      <section className="py-20 bg-green-600 dark:bg-green-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            It takes less than 5 minutes to analyze your portfolio. No email required, 
            no complicated forms, no sales calls. Just honest insights about your investments.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-green-600 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Try Portfolio Risk Analyzer Demo
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>Important:</strong> This is a demonstration tool for educational purposes. Always consult with qualified financial advisors before making investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}