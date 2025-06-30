import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PortfolioAllocation, PortfolioInput, OptimizationResult } from './types';
import { analyzePortfolio } from './services/api';
import { ThemeToggle } from './components/ThemeToggle';
import { AllocationSlider } from './components/AllocationSlider';
import { AlternativesSelector } from './components/AlternativesSelector';
import { MetricCard } from './components/MetricCard';
import { AllocationChart } from './components/AllocationChart';
import { ComparisonChart } from './components/ComparisonChart';
import { RiskReturnChart } from './components/RiskReturnChart';
import { TrendingUp, Shield, Target, BarChart3, Lightbulb, BookOpen, Zap } from 'lucide-react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RecommendationDropdown } from './components/RecommendationDropdown';

// Preset portfolio templates
const PRESET_ALLOCATIONS = {
  conservative: { stocks: 0.3, bonds: 0.6, alternatives: 0.05, cash: 0.05 },
  balanced: { stocks: 0.6, bonds: 0.3, alternatives: 0.1, cash: 0.0 },
  aggressive: { stocks: 0.8, bonds: 0.1, alternatives: 0.1, cash: 0.0 },
  income: { stocks: 0.2, bonds: 0.7, alternatives: 0.05, cash: 0.05 },
} as const;

function App() {
  const [isDark, setIsDark] = useState(() => {
    // Check system preference on initial load
    if (typeof window !== 'undefined') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Apply dark class immediately to prevent flash
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
      return isDarkMode;
    }
    return false;
  });
  const [allocation, setAllocation] = useState<PortfolioAllocation>({
    stocks: 0.6,
    bonds: 0.3,
    alternatives: 0.1,
    cash: 0.0,
  });
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetReturn, setTargetReturn] = useState<number>(8);
  const [optimizationGoal, setOptimizationGoal] = useState<'sharpe' | 'risk' | 'return' | 'income'>('sharpe');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Memoized allocation total to prevent unnecessary recalculations
  const allocationTotal = useMemo(() => 
    Object.values(allocation).reduce((sum, val) => sum + val, 0),
    [allocation]
  );

  // Calculate remaining allocation for real-time feedback
  const remainingAllocation = useMemo(() => 1 - allocationTotal, [allocationTotal]);

  // Memoized allocation change handler
  const handleAllocationChange = useCallback((key: keyof PortfolioAllocation, value: number) => {
    setAllocation(prev => {
      const newAllocation = { ...prev, [key]: value };
      
      // Ensure total doesn't exceed 1
      const total = Object.values(newAllocation).reduce((sum, val) => sum + val, 0);
      if (total <= 1.0) { // Prevent total from exceeding 100%
        return newAllocation;
      }
      return prev; // Return previous state if validation fails
    });
  }, []);

  // Memoized normalization function
  const normalizeAllocation = useCallback(() => {
    setAllocation(prev => {
      const total = Object.values(prev).reduce((sum, val) => sum + val, 0);
      if (total > 0 && Math.abs(total - 1.0) > 0.01) {
        return Object.entries(prev).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value / total,
          }),
          {} as PortfolioAllocation
        );
      }
      return prev;
    });
  }, []);

  // Apply preset allocation
  const applyPreset = useCallback((presetKey: keyof typeof PRESET_ALLOCATIONS) => {
    setAllocation(PRESET_ALLOCATIONS[presetKey]);
  }, []);

  // Memoized analysis handler with proper error boundaries
  const handleAnalyze = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate allocation total
      if (Math.abs(allocationTotal - 1.0) > 0.01) {
        throw new Error('Portfolio allocation must sum to 100%');
      }

      // Normalize allocation
      const total = allocationTotal;
      const normalizedAllocation = Object.entries(allocation).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: total > 0 ? value / total : 0,
        }),
        {} as PortfolioAllocation
      );

      // Validate normalized allocation
      const normalizedTotal = Object.values(normalizedAllocation).reduce((sum, val) => sum + val, 0);
      if (Math.abs(normalizedTotal - 1.0) > 0.01) {
        throw new Error('Unable to normalize portfolio allocation');
      }

      const portfolioInput: PortfolioInput = {
        allocation: normalizedAllocation,
        risk_tolerance: riskTolerance,
        target_return: targetReturn / 100,
        optimization_goal: optimizationGoal,
      };

      console.log('Starting portfolio analysis with:', portfolioInput);
      const analysisResult = await analyzePortfolio(portfolioInput);
      console.log('Analysis completed successfully:', analysisResult);
      setResult(analysisResult);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze portfolio. Please try again.';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [allocation, allocationTotal, riskTolerance, targetReturn, optimizationGoal, loading]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 animate-in">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400 font-display">
              Portfolio Risk Analyzer
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
              Analyze your portfolio risk and get optimization recommendations
            </p>
          </div>
          <div className="animate-in-delay-1">
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          {/* Input Panel */}
          <div className="space-y-6 animate-in-delay-1">
            <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-8 border border-gray-200/50 dark:border-gray-700/50 ">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary-100 dark:bg-primary-800/30 rounded-xl border border-primary-200/30 dark:border-primary-700/30">
                  <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                  Portfolio Allocation
                </h2>
              </div>

              {/* Preset Templates */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg border border-amber-200/30 dark:border-amber-700/30">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 ml-3 font-display">
                    Quick Templates
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => applyPreset('conservative')}
                    className="px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:scale-[1.02] font-medium"
                  >
                    Conservative
                  </button>
                  <button
                    onClick={() => applyPreset('balanced')}
                    className="px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:scale-[1.02] font-medium"
                  >
                    Balanced (60/40)
                  </button>
                  <button
                    onClick={() => applyPreset('aggressive')}
                    className="px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:scale-[1.02] font-medium"
                  >
                    Aggressive
                  </button>
                  <button
                    onClick={() => applyPreset('income')}
                    className="px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:scale-[1.02] font-medium"
                  >
                    Income Focus
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <AllocationSlider
                  label="Stocks"
                  value={allocation.stocks}
                  onChange={(value) => handleAllocationChange('stocks', value)}
                  description="Equity investments for long-term growth"
                  color="#3b82f6"
                />
                <AllocationSlider
                  label="Bonds"
                  value={allocation.bonds}
                  onChange={(value) => handleAllocationChange('bonds', value)}
                  description="Fixed income for stability and income"
                  color="#10b981"
                />
                <AlternativesSelector
                  value={allocation.alternatives}
                  onChange={(value) => handleAllocationChange('alternatives', value)}
                  description="Alternative investments including REITs, commodities, crypto, and private equity for diversification"
                  color="#f59e0b"
                />
                <AllocationSlider
                  label="Cash"
                  value={allocation.cash}
                  onChange={(value) => handleAllocationChange('cash', value)}
                  description="Cash and short-term instruments for liquidity"
                  color="#6b7280"
                />
              </div>

              <div className={`mt-4 p-3 rounded-lg transition-colors ${
                Math.abs(allocationTotal - 1) < 0.01 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : allocationTotal > 1 
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Allocation:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      Math.abs(allocationTotal - 1) < 0.01 ? 'text-green-600 dark:text-green-400' : 
                      allocationTotal > 1 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {(allocationTotal * 100).toFixed(1)}%
                    </span>
                    {remainingAllocation !== 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({remainingAllocation > 0 ? '+' : ''}{(remainingAllocation * 100).toFixed(1)}% remaining)
                      </span>
                    )}
                  </div>
                </div>
                {Math.abs(allocationTotal - 1) > 0.01 && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={normalizeAllocation}
                      className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 underline"
                    >
                      Normalize to 100%
                    </button>
                    {allocationTotal < 1 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Portfolio is underallocated
                      </span>
                    )}
                    {allocationTotal > 1 && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        Portfolio exceeds 100%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-8 border border-gray-200/50 dark:border-gray-700/50  animate-in-delay-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-800/30 rounded-xl border border-emerald-200/30 dark:border-emerald-700/30">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                  Investment Preferences
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Optimization Goal
                  </label>
                  <select
                    value={optimizationGoal}
                    onChange={(e) => setOptimizationGoal(e.target.value as 'sharpe' | 'risk' | 'return' | 'income')}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="sharpe">Maximize Sharpe Ratio (Risk-Adjusted Return)</option>
                    <option value="return">Maximize Expected Return</option>
                    <option value="risk">Minimize Risk (Volatility)</option>
                    <option value="income">Maximize Income Generation</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {optimizationGoal === 'sharpe' && 'Find the best risk-adjusted returns'}
                    {optimizationGoal === 'return' && 'Prioritize highest expected returns'}
                    {optimizationGoal === 'risk' && 'Minimize portfolio volatility'}
                    {optimizationGoal === 'income' && 'Focus on dividends and income'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risk Tolerance
                  </label>
                  <select
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="low">Conservative (Low Risk)</option>
                    <option value="medium">Moderate (Medium Risk)</option>
                    <option value="high">Aggressive (High Risk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Annual Return: {targetReturn}%
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="0.5"
                    value={targetReturn}
                    onChange={(e) => setTargetReturn(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || Math.abs(allocationTotal - 1) > 0.01}
                className="w-full mt-8 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100"
              >
                {loading ? (
                  <LoadingSpinner size="md" className="text-white" />
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analyze Portfolio
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6 animate-in-delay-2">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {result && (
              <>
                {/* Risk Metrics */}
                <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-8 border border-gray-200/50 dark:border-gray-700/50  animate-in">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                      Risk Metrics
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                      title="Expected Return"
                      value={`${result.current_metrics.expected_return.toFixed(2)}%`}
                      explanation="The expected annual return of your portfolio based on historical data"
                    />
                    <MetricCard
                      title="Volatility"
                      value={`${result.current_metrics.volatility.toFixed(2)}%`}
                      explanation="The standard deviation of returns, measuring price fluctuation risk"
                    />
                    <MetricCard
                      title="Sharpe Ratio"
                      value={result.current_metrics.sharpe_ratio.toFixed(3)}
                      explanation="Risk-adjusted return measure. Higher is better (>1 is good, >2 is excellent)"
                    />
                    <MetricCard
                      title="Diversification"
                      value={`${result.current_metrics.diversification_score.toFixed(1)}`}
                      explanation="How well diversified your portfolio is. Higher scores indicate better diversification"
                    />
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 animate-in-delay-1">
                  <ComparisonChart
                    currentAllocation={allocation}
                    optimizedAllocation={result.optimized_allocation}
                  />
                  <RiskReturnChart
                    currentMetrics={result.current_metrics}
                    optimizedMetrics={result.optimized_metrics}
                  />
                </div>

                {/* Recommendations */}
                <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-8 border border-gray-200/50 dark:border-gray-700/50  animate-in-delay-1">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-800/30 rounded-xl border border-yellow-200/30 dark:border-yellow-700/30">
                      <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                      Recommendations
                    </h2>
                  </div>
                  <RecommendationDropdown recommendations={result?.recommendations || []} />
                </div>

                {/* Educational Content */}
                {result.explanations.length > 0 && (
                  <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-8 border border-gray-200/50 dark:border-gray-700/50  animate-in-delay-2">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
                        <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                        Educational Insights
                      </h2>
                    </div>
                    <ul className="space-y-2">
                      {result.explanations.map((explanation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-2 w-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">{explanation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
