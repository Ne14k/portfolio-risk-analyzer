import React from 'react';
import { Header } from './Header';
import { SignupCTA } from './SignupCTA';
import { FileBarChart, Upload, Link as LinkIcon, Shield, Zap, CheckCircle } from 'lucide-react';

interface ImportPortfolioPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function ImportPortfolioPage({ isDark, onThemeToggle }: ImportPortfolioPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 dark:bg-primary-800/30 rounded-2xl flex items-center justify-center">
              <FileBarChart className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Import Your Portfolio
              <span className="text-green-600 dark:text-green-400 block">
                In Seconds
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect your brokerage accounts securely or upload your portfolio files. 
              We'll automatically import all your holdings and start analyzing them instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Plaid Integration */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-800/30 rounded-xl">
                  <LinkIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Connect Your Accounts
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Securely connect to over 12,000 financial institutions using Plaid's bank-grade security. 
                Your login credentials are never stored on our servers.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Fidelity, Schwab, Vanguard, TD Ameritrade</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Robinhood, E*TRADE, Interactive Brokers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">401(k), IRA, and taxable accounts</span>
                </div>
              </div>
            </div>

            {/* Visual Mockup */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bank-Level Security</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your data is encrypted and protected with the same security used by major banks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File Upload Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Visual Mockup */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Drag & Drop Your Files
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  CSV, Excel, or PDF statements
                </p>
              </div>
            </div>

            {/* File Upload Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-xl">
                  <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upload Portfolio Files
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Prefer to upload files? No problem. We support CSV exports from all major brokerages, 
                Excel spreadsheets, and even PDF statements.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">Automatic data extraction from PDFs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">Smart detection of holdings and allocations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">Manual entry option for any missing data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup CTA */}
      <SignupCTA 
        featureName="Portfolio Import"
        description="Connect your accounts or upload files to automatically analyze your entire portfolio."
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