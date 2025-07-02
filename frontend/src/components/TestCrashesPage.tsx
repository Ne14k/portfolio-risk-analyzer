import React from 'react';
import { Header } from './Header';
import { SignupCTA } from './SignupCTA';
import { AlertTriangle, TrendingDown, Shield, BarChart3, Calendar, Target } from 'lucide-react';

interface TestCrashesPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function TestCrashesPage({ isDark, onThemeToggle }: TestCrashesPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-800/30 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Test Your Portfolio Against
              <span className="text-red-600 dark:text-red-400 block">
                Market Crashes
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              See how your portfolio would have performed during major market crashes like 2008, COVID-19, 
              or the dot-com bubble. Prepare for the next downturn before it happens.
            </p>
          </div>
        </div>
      </section>

      {/* Historical Scenarios Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Major Market Stress Tests
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See how your portfolio would survive history's worst market events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="w-12 h-12 mb-4 bg-red-100 dark:bg-red-800/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                2008 Financial Crisis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                The worst financial crisis since the Great Depression. Markets fell 50%+ and took years to recover.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">-37%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Your portfolio impact</div>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="w-12 h-12 mb-4 bg-orange-100 dark:bg-orange-800/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                COVID-19 Crash (2020)
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                The fastest 30% market decline in history, triggered by global pandemic lockdowns.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">-24%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Your portfolio impact</div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="w-12 h-12 mb-4 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Dot-Com Bubble (2000)
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Tech stocks crashed 78% as internet company valuations collapsed over 3 years.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">-31%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Your portfolio impact</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recovery Analysis Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-800/30 rounded-xl">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recovery Time Analysis
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Understanding how long it takes your portfolio to recover from crashes is crucial 
                for planning. See detailed timelines and what factors speed up recovery.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">2008 Crisis Recovery</span>
                  <span className="font-semibold text-gray-900 dark:text-white">4.2 years</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">COVID Recovery</span>
                  <span className="font-semibold text-gray-900 dark:text-white">5 months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Dot-Com Recovery</span>
                  <span className="font-semibold text-gray-900 dark:text-white">7.3 years</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Crash Resilience Score
              </h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">B+</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Your portfolio shows good resilience to market crashes
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Downside Protection</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Good</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Recovery Speed</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Average</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Diversification</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stress Test Features */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Advanced Stress Testing Features
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Custom Scenarios
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your own stress test scenarios. What if tech stocks fall 60%? What if interest rates spike?
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-800/30 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Fed Policy Changes
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                See how your portfolio reacts to Federal Reserve policy changes like rate hikes or QE programs.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Tail Risk Events
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Prepare for extreme "black swan" events that happen rarely but have massive impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signup CTA */}
      <SignupCTA 
        featureName="Market Crash Testing"
        description="Stress test your portfolio against historical crashes and see how well it would survive the next downturn."
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