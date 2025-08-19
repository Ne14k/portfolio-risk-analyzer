import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, ArrowRight, DollarSign } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LandingPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function LandingPage({ isDark, onThemeToggle }: LandingPageProps) {
  useEffect(() => {
    document.title = 'MyPortfolioTracker - Home';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />

      {/* Hero Section - Meraki UI Inspired */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Your New Portfolio Analyser
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light">
                Get clear, honest insights about your portfolio's risk and performance in minutes, not months.
              </p>
            </div>
            
            <div className="flex justify-center items-center pt-4">
              <Link
                to="/demo"
                className="group inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                View Demo
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Meraki UI Inspired */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Common Investment Challenges
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Identify and overcome the obstacles that prevent optimal portfolio performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="group p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-3xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Unclear Diversification
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Many investors think they're diversified because they own different stocks, 
                but they're actually concentrated in similar sectors or risk profiles.
              </p>
            </div>
            
            <div className="group p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-3xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Unknown Risk Levels
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Without proper analysis, you might be taking unnecessary risks that could 
                wipe out years of gains, or playing it too safe and missing growth opportunities.
              </p>
            </div>
            
            <div className="group p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-3xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-2xl flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Expensive Advisory Fees
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Professional portfolio analysis can cost thousands of dollars, making it 
                inaccessible for regular investors who just want basic insights.
              </p>
            </div>
            
            <div className="group p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-3xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Complex Financial Jargon
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
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
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
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
      <section className="py-20 bg-gray-900 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            It takes less than 5 minutes to analyze your portfolio. No email required, 
            no complicated forms, no sales calls. Just honest insights about your investments.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View Demo
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}