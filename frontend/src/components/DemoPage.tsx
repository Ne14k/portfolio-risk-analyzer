import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PortfolioAllocation, PortfolioInput, OptimizationResult } from '../types';
import { analyzePortfolio } from '../services/api';
import { Header } from './Header';
import { AllocationSlider } from './AllocationSlider';
import { AlternativesSelector } from './AlternativesSelector';
import { MetricCard } from './MetricCard';
import { ComparisonChart } from './ComparisonChart';
import { RiskReturnChart } from './RiskReturnChart';
import { TrendingUp, Shield, Target, BarChart3, BookOpen, Zap, ArrowRight, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { EducationalDropdown } from './EducationalDropdown';
import { AIRiskExplanation } from './AIRiskExplanation';

// Preset portfolio templates
const PRESET_ALLOCATIONS = {
  conservative: { stocks: 0.3, bonds: 0.6, alternatives: 0.05, cash: 0.05 },
  balanced: { stocks: 0.6, bonds: 0.3, alternatives: 0.1, cash: 0.0 },
  aggressive: { stocks: 0.8, bonds: 0.1, alternatives: 0.1, cash: 0.0 },
  income: { stocks: 0.2, bonds: 0.7, alternatives: 0.05, cash: 0.05 },
} as const;

interface DemoPageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function DemoPage({ isDark, onThemeToggle }: DemoPageProps) {
  const [allocation, setAllocation] = useState<PortfolioAllocation>({
    stocks: 0.0,
    bonds: 0.0,
    alternatives: 0.0,
    cash: 0.0,
  });
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetReturn, setTargetReturn] = useState<number>(8);
  const [optimizationGoal, setOptimizationGoal] = useState<'sharpe' | 'risk' | 'return' | 'income'>('sharpe');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const isInitialRender = useRef(true);

  // Clear results when investment preferences change
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    setResult(null);
    setError(null);
  }, [riskTolerance, targetReturn, optimizationGoal]);

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
      // Calculate what the total would be with this change
      const otherTotal = Object.entries(prev)
        .filter(([k]) => k !== key)
        .reduce((sum, [, val]) => sum + val, 0);
      
      // Don't allow the new value to make total exceed 1.0
      const maxAllowable = 1 - otherTotal;
      const constrainedValue = Math.min(value, maxAllowable);
      
      const newAllocation = { ...prev, [key]: constrainedValue };
      return newAllocation;
    });
    
    // Clear results when allocation changes
    setResult(null);
    setError(null);
  }, []);

  // Apply preset allocation
  const applyPreset = useCallback((presetKey: keyof typeof PRESET_ALLOCATIONS) => {
    setAllocation(PRESET_ALLOCATIONS[presetKey]);
    
    // Clear results when preset is applied
    setResult(null);
    setError(null);
  }, []);

  // Reset all allocations to 0
  const resetAllocation = useCallback(() => {
    setAllocation({
      stocks: 0,
      bonds: 0,
      alternatives: 0,
      cash: 0,
    });
    
    // Clear results when allocation is reset
    setResult(null);
    setError(null);
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
        esg_preferences: undefined,
        tax_preferences: undefined,
        sector_preferences: undefined,
        use_ai_optimization: true,
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
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Page Title */}
        <div className="text-center mb-8 animate-in">
          <h1 className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 font-display mb-2">
            Portfolio Risk Analyzer Demo
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Let's take a look at your investment portfolio and see how we can make it work better for you
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8 overflow-visible">
          {/* Input Panel */}
          <div className="space-y-6 animate-in-delay-1">
            <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 ">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary-100 dark:bg-primary-800/30 rounded-xl border border-primary-200/30 dark:border-primary-700/30">
                  <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                  Tell Us About Your Portfolio
                </h2>
              </div>

              {/* Preset Templates */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg border border-amber-200/30 dark:border-amber-700/30">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 ml-3 font-display">
                    Quick Start Templates
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Not sure where to start? Try one of these common portfolio approaches:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => applyPreset('conservative')}
                    className="px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:scale-[1.02] font-medium"
                  >
                    Conservative (Play it safe)
                  </button>
                  <button
                    onClick={() => applyPreset('balanced')}
                    className="px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:scale-[1.02] font-medium"
                  >
                    Balanced (60/40 mix)
                  </button>
                  <button
                    onClick={() => applyPreset('aggressive')}
                    className="px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:scale-[1.02] font-medium"
                  >
                    Aggressive (Go for growth)
                  </button>
                  <button
                    onClick={() => applyPreset('income')}
                    className="px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:scale-[1.02] font-medium"
                  >
                    Income Focus (Steady payouts)
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <AllocationSlider
                  label="Stocks"
                  value={allocation.stocks}
                  onChange={(value) => handleAllocationChange('stocks', value)}
                  description="Individual company stocks and stock funds for long-term growth"
                  color="#3b82f6"
                  remainingAllocation={remainingAllocation}
                />
                <AllocationSlider
                  label="Bonds"
                  value={allocation.bonds}
                  onChange={(value) => handleAllocationChange('bonds', value)}
                  description="Government and corporate bonds for steady income and stability"
                  color="#10b981"
                  remainingAllocation={remainingAllocation}
                />
                <AlternativesSelector
                  value={allocation.alternatives}
                  onChange={(value) => handleAllocationChange('alternatives', value)}
                  description="REITs, commodities, crypto, and other investments for extra diversification"
                  color="#f59e0b"
                  remainingAllocation={remainingAllocation}
                />
                <AllocationSlider
                  label="Cash"
                  value={allocation.cash}
                  onChange={(value) => handleAllocationChange('cash', value)}
                  description="Savings accounts, CDs, and money market funds for easy access"
                  color="#6b7280"
                  remainingAllocation={remainingAllocation}
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
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        Math.abs(allocationTotal - 1) < 0.01 ? 'text-green-600 dark:text-green-400' : 
                        allocationTotal > 1 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {(allocationTotal * 100).toFixed(1)}%
                      </span>
                      {Math.abs(allocationTotal - 1) >= 0.0001 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({remainingAllocation > 0 ? '+' : ''}{(remainingAllocation * 100).toFixed(1)}% remaining)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={resetAllocation}
                      className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-105 group"
                      title="Start over with 0%"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-500 dark:text-gray-400 dark:group-hover:text-red-400" />
                    </button>
                  </div>
                </div>
                {allocationTotal > 1 && (
                  <div className="mt-2">
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Looks like you've gone over 100% - try adjusting your allocations
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50  animate-in-delay-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-800/30 rounded-xl border border-emerald-200/30 dark:border-emerald-700/30">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                  Your Investment Goals
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What's most important to you?
                  </label>
                  <select
                    value={optimizationGoal}
                    onChange={(e) => setOptimizationGoal(e.target.value as 'sharpe' | 'risk' | 'return' | 'income')}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="sharpe">Best balance of risk and return</option>
                    <option value="return">Highest possible returns</option>
                    <option value="risk">Lowest possible risk</option>
                    <option value="income">Steady income from dividends</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {optimizationGoal === 'sharpe' && 'Get the most bang for your buck - good returns without crazy risk'}
                    {optimizationGoal === 'return' && 'Maximize growth potential - higher risk, higher reward'}
                    {optimizationGoal === 'risk' && 'Sleep well at night - prioritize protecting what you have'}
                    {optimizationGoal === 'income' && 'Generate regular income - focus on dividends and payouts'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How do you feel about market ups and downs?
                  </label>
                  <select
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="low">I prefer steady and predictable</option>
                    <option value="medium">I can handle some ups and downs</option>
                    <option value="high">Bring on the roller coaster</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What return are you hoping for each year? {targetReturn}%
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
                    <span>2% (Very safe)</span>
                    <span>15% (Very ambitious)</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Remember: higher returns usually mean taking on more risk
                  </p>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || Math.abs(allocationTotal - 1) > 0.01}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100"
              >
                {loading ? (
                  <LoadingSpinner size="md" className="text-white" />
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analyze My Portfolio
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-in-delay-2">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-8 animate-in-delay-2">
              <>
                {/* Risk Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50  animate-in overflow-visible">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                      Your Portfolio Analysis
                    </h2>
                  </div>
                  
                  {/* AI Risk Explanation */}
                  <div className="mb-6">
                    <AIRiskExplanation
                      allocation={allocation}
                      metrics={result.current_metrics}
                      riskTolerance={riskTolerance}
                      optimizationGoal={optimizationGoal}
                      targetReturn={targetReturn}
                      esgPreferences={undefined}
                      taxPreferences={undefined}
                      sectorPreferences={undefined}
                      useAIOptimization={true}
                    />
                  </div>
                  
                  {/* Traditional Metrics - Collapsible */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button
                      onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
                      className="w-full flex items-center justify-between mb-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Detailed Numbers
                      </h3>
                      {showDetailedMetrics ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    
                    {showDetailedMetrics && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in-0 slide-in-from-top-2 duration-200 relative">
                        <MetricCard
                          title="Expected Return"
                          value={`${result.current_metrics.expected_return.toFixed(2)}%`}
                          explanation="What you might expect your portfolio to return each year on average"
                        />
                        <MetricCard
                          title="Volatility"
                          value={`${result.current_metrics.volatility.toFixed(2)}%`}
                          explanation="How much your portfolio value might swing up and down"
                        />
                        <MetricCard
                          title="Sharpe Ratio"
                          value={result.current_metrics.sharpe_ratio.toFixed(3)}
                          explanation="Risk-adjusted return score. Higher is better (above 1 is good, above 2 is excellent)"
                        />
                        <MetricCard
                          title="Diversification"
                          value={`${result.current_metrics.diversification_score.toFixed(1)}`}
                          explanation="How well spread out your investments are. Higher scores mean better diversification"
                        />
                      </div>
                    )}
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

                {/* Educational Content */}
                <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50  animate-in-delay-2">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
                      <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 ml-4 font-display">
                      Learn More About Your Results
                    </h2>
                  </div>
                  <EducationalDropdown 
                    allocation={allocation}
                    result={result}
                    riskTolerance={riskTolerance}
                    optimizationGoal={optimizationGoal}
                    targetReturn={targetReturn}
                  />
                </div>

                {/* Divider */}
                <div className="my-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                        Want to take the next step?
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signup Call-to-Action */}
                <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 animate-in-delay-3 text-center">
                  <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">
                    Ready to Optimize Your Portfolio?
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Sign up to get full access to portfolio analysis, optimization recommendations, and ongoing monitoring tools. 
                    Take control of your financial future with clear insights.
                  </p>
                  <button
                    onClick={() => {
                      alert('Sign up functionality coming soon!');
                    }}
                    className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Sign Up Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong>Important:</strong> This is a demonstration tool for educational purposes. Always consult with qualified financial advisors before making investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}