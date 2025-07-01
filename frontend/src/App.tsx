import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PortfolioAllocation, PortfolioInput, OptimizationResult, ESGPreferences, TaxPreferences, SectorPreferences } from './types';
import { analyzePortfolio } from './services/api';
import { ThemeToggle } from './components/ThemeToggle';
import { AllocationSlider } from './components/AllocationSlider';
import { AlternativesSelector } from './components/AlternativesSelector';
import { MetricCard } from './components/MetricCard';
import { AllocationChart } from './components/AllocationChart';
import { ComparisonChart } from './components/ComparisonChart';
import { RiskReturnChart } from './components/RiskReturnChart';
import { TrendingUp, Shield, Target, BarChart3, BookOpen, Zap, ArrowRight, ChevronDown, ChevronUp, Settings, Trash2 } from 'lucide-react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { EducationalDropdown } from './components/EducationalDropdown';
import { AIRiskExplanation } from './components/AIRiskExplanation';

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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const isInitialRender = useRef(true);
  
  // Advanced preferences
  const [esgPreferences, setESGPreferences] = useState<ESGPreferences>({
    environmental: 0.5,
    social: 0.5,
    governance: 0.5,
    overall_importance: 0.3
  });
  
  const [taxPreferences, setTaxPreferences] = useState<TaxPreferences>({
    tax_bracket: 0.25,
    prefer_tax_efficient: true,
    account_type: 'taxable'
  });
  
  const [sectorPreferences, setSectorPreferences] = useState<SectorPreferences>({
    max_sector_concentration: 0.3
  });
  

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

  // Clear results when investment preferences change
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    setResult(null);
    setError(null);
  }, [riskTolerance, targetReturn, optimizationGoal, esgPreferences, taxPreferences, sectorPreferences]);

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
    
    // Clear results when allocation is normalized
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
        esg_preferences: showAdvancedOptions ? esgPreferences : undefined,
        tax_preferences: showAdvancedOptions ? taxPreferences : undefined,
        sector_preferences: showAdvancedOptions ? sectorPreferences : undefined,
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
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

        <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8 overflow-visible">
          {/* Input Panel */}
          <div className="space-y-6 animate-in-delay-1">
            <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 ">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  remainingAllocation={remainingAllocation}
                />
                <AllocationSlider
                  label="Bonds"
                  value={allocation.bonds}
                  onChange={(value) => handleAllocationChange('bonds', value)}
                  description="Fixed income for stability and income"
                  color="#10b981"
                  remainingAllocation={remainingAllocation}
                />
                <AlternativesSelector
                  value={allocation.alternatives}
                  onChange={(value) => handleAllocationChange('alternatives', value)}
                  description="Alternative investments including REITs, commodities, crypto, and private equity for diversification"
                  color="#f59e0b"
                  remainingAllocation={remainingAllocation}
                />
                <AllocationSlider
                  label="Cash"
                  value={allocation.cash}
                  onChange={(value) => handleAllocationChange('cash', value)}
                  description="Cash and short-term instruments for liquidity"
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
                      title="Reset all allocations to 0%"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-500 dark:text-gray-400 dark:group-hover:text-red-400" />
                    </button>
                  </div>
                </div>
                {allocationTotal > 1 && (
                  <div className="mt-2">
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Portfolio exceeds 100%
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


                {/* Advanced Options */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Optimization Options</span>
                    </div>
                    {showAdvancedOptions ? (
                      <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>

                  {showAdvancedOptions && (
                    <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      
                      {/* ESG Preferences */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">ESG Preferences</h4>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            ESG Importance: {(esgPreferences.overall_importance * 100).toFixed(0)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={esgPreferences.overall_importance}
                            onChange={(e) => setESGPreferences(prev => ({...prev, overall_importance: parseFloat(e.target.value)}))}
                            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Returns Focus</span>
                            <span>ESG Focus</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Environmental: {(esgPreferences.environmental * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={esgPreferences.environmental}
                              onChange={(e) => setESGPreferences(prev => ({...prev, environmental: parseFloat(e.target.value)}))}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Social: {(esgPreferences.social * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={esgPreferences.social}
                              onChange={(e) => setESGPreferences(prev => ({...prev, social: parseFloat(e.target.value)}))}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Governance: {(esgPreferences.governance * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={esgPreferences.governance}
                              onChange={(e) => setESGPreferences(prev => ({...prev, governance: parseFloat(e.target.value)}))}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tax Preferences */}
                      <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Tax Optimization</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Account Type</label>
                            <select
                              value={taxPreferences.account_type}
                              onChange={(e) => setTaxPreferences(prev => ({...prev, account_type: e.target.value as any}))}
                              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="taxable">Taxable Account</option>
                              <option value="ira">Traditional IRA</option>
                              <option value="401k">401(k)</option>
                              <option value="roth">Roth IRA/401(k)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Tax Bracket: {(taxPreferences.tax_bracket * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              min="0.1"
                              max="0.45"
                              step="0.01"
                              value={taxPreferences.tax_bracket}
                              onChange={(e) => setTaxPreferences(prev => ({...prev, tax_bracket: parseFloat(e.target.value)}))}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="tax-efficient"
                            checked={taxPreferences.prefer_tax_efficient}
                            onChange={(e) => setTaxPreferences(prev => ({...prev, prefer_tax_efficient: e.target.checked}))}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="tax-efficient" className="text-xs text-gray-700 dark:text-gray-300">
                            Prioritize tax-efficient investments
                          </label>
                        </div>
                      </div>

                      {/* Sector Preferences */}
                      <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sector Diversification</h4>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Max Single Sector: {(sectorPreferences.max_sector_concentration * 100).toFixed(0)}%
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="0.5"
                            step="0.05"
                            value={sectorPreferences.max_sector_concentration}
                            onChange={(e) => setSectorPreferences(prev => ({...prev, max_sector_concentration: parseFloat(e.target.value)}))}
                            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>10%</span>
                            <span>50%</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
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
                      Risk Analysis
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
                      esgPreferences={showAdvancedOptions ? esgPreferences : undefined}
                      taxPreferences={showAdvancedOptions ? taxPreferences : undefined}
                      sectorPreferences={showAdvancedOptions ? sectorPreferences : undefined}
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
                        Detailed Metrics
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
                      Educational Insights
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
                        Ready to optimize your portfolio?
                      </span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Improvement Plan Button */}
                <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 animate-in-delay-3 text-center">
                  <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">
                    Get Your Personal Portfolio Improvement Plan
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Receive a tailored step-by-step plan to optimize your portfolio over time, with specific actionable recommendations based on your risk tolerance and goals.
                  </p>
                  <button
                    onClick={() => {
                      // TODO: Navigate to improvement plan page
                      console.log('Navigate to portfolio improvement plan');
                    }}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Create My Improvement Plan
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong>Disclaimer:</strong> This application is for learning and demonstration purposes only. 
              It should not be used as the sole basis for any investment decisions. 
              Always consult with qualified financial advisors before making any investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
