import React, { useState, useEffect } from 'react';
import { Portfolio } from '../types/portfolio';
import { MonteCarloChart } from './MonteCarloChart';
import { MonteCarloInsights } from './MonteCarloInsights';
import { ForecastExporter } from '../utils/exportUtils';
import { PerformanceOptimizer, ProgressTracker, ErrorRecovery, ProgressUpdate } from '../utils/performanceUtils';
import { ProfessionalForecastAPI } from '../services/professionalForecastApi';
import { TrendingUp, Calendar, Settings, Download, Play, Loader2, FileText, FileSpreadsheet, FileImage, AlertTriangle } from 'lucide-react';

interface ForecastData {
  currentTotalValue: number;
  forecastData: Array<{
    date: string;
    totalValue: number;
    gainLoss: number;
    gainLossPercentage: number;
  }>;
  individualAssets: Array<{
    ticker: string;
    currentPrice: number;
    forecastedPrices: Array<{
      date: string;
      predictedPrice: number;
      portfolioValueContribution: number;
    }>;
  }>;
  monteCarloResults?: {
    numSimulations: number;
    percentile5: number[];
    percentile25: number[];
    percentile50: number[];
    percentile75: number[];
    percentile95: number[];
    probabilityPositive: number;
    probabilityLoss5Percent: number;
    probabilityLoss10Percent: number;
    probabilityGain10Percent: number;
    probabilityGain20Percent: number;
    expectedValue: number;
    valueAtRisk5: number;
    valueAtRisk1: number;
    conditionalValueAtRisk: number;
    simulationSummary: {
      meanReturn: number;
      volatility: number;
      sharpeRatio: number;
      skewness: number;
      kurtosis: number;
      downsideDeviation: number;
      maximumDrawdown: number;
    };
  };
  summary: {
    timeHorizon: string;
    initialValue: number;
    finalProjectedValue: number;
    totalProjectedGain: number;
    totalProjectedGainPercentage: number;
    annualizedReturn: number;
    forecastGeneratedAt: string;
    monteCarloInsights?: string[];
  };
  metadata?: {
    engine: string;
    version: string;
    generated_at: string;
    data_quality_warning: boolean;
    warnings: string[];
    dataQuality?: {
      overall_quality_score: number;
      data_coverage: number;
      assets_with_data: number;
      total_assets: number;
      quality_by_asset: { [ticker: string]: any };
    };
  };
}

interface PortfolioForecastProps {
  portfolio: Portfolio;
  className?: string;
}

export function PortfolioForecast({ portfolio, className = "" }: PortfolioForecastProps) {
  // All state declarations at the top
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeHorizon, setTimeHorizon] = useState<'1_month' | '3_months' | '1_year'>('3_months');
  const monteCarloSimulations = 5000; // Fixed number of simulations
  const [progress, setProgress] = useState<ProgressUpdate>({ phase: 'idle', progress: 0, message: '' });
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getTimeHorizonLabel = (horizon: string): string => {
    switch (horizon) {
      case '1_month': return '1 Month';
      case '3_months': return '3 Months';
      case '1_year': return '1 Year';
      default: return horizon;
    }
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);


  const generateForecast = async () => {
    if (!portfolio || portfolio.holdings.length === 0) {
      setError('Please add holdings to your portfolio before generating a forecast.');
      return;
    }

    const holdings = portfolio.holdings.map(holding => ({
      ticker: holding.ticker,
      name: holding.name,
      quantity: holding.quantity,
      currentPrice: holding.currentPrice,
      marketValue: holding.quantity * holding.currentPrice
    }));

    // Check cache first
    const cacheKey = PerformanceOptimizer.createCacheKey(holdings, timeHorizon, monteCarloSimulations);
    const cachedResult = PerformanceOptimizer.getCachedForecast(cacheKey);
    
    if (cachedResult) {
      console.log('Using cached forecast result');
      setForecastData(cachedResult);
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({ phase: 'preparing', progress: 10, message: 'Preparing forecast request...' });

    try {
      const requestBody = {
        holdings,
        timeHorizon,
        includeScenarios: true,
        includeMonteCarlo: true,
        monteCarloSimulations
      };

      console.log('Generating forecast with:', requestBody);
      setProgress({ phase: 'fetching_data', progress: 30, message: 'Fetching historical market data...' });

      // Use mock API for now (replace with real API call later)
      setProgress({ phase: 'running_simulation', progress: 60, message: 'Running Monte Carlo simulations...' });
      const data = await ProfessionalForecastAPI.generateForecast(requestBody);

      setProgress({ phase: 'processing_results', progress: 90, message: 'Processing results...' });
      
      console.log('Forecast data received:', data);
      
      // Cache the result
      PerformanceOptimizer.cacheForecast(cacheKey, data);
      
      setForecastData(data);
      setProgress({ phase: 'complete', progress: 100, message: 'Forecast complete!' });
      
      // Clear progress after a short delay
      setTimeout(() => {
        setProgress({ phase: 'idle', progress: 0, message: '' });
      }, 2000);
      
    } catch (err) {
      console.error('Error generating forecast:', err);
      setError(`Failed to generate forecast: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
      setProgress({ phase: 'error', progress: 0, message: 'Forecast failed' });
    } finally {
      setLoading(false);
    }
  };

  const exportForecast = (format: 'json' | 'csv' | 'pdf') => {
    if (!forecastData) return;

    switch (format) {
      case 'json':
        ForecastExporter.exportAsJSON(forecastData, portfolio, timeHorizon);
        break;
      case 'csv':
        ForecastExporter.exportAsCSV(forecastData, portfolio, timeHorizon);
        break;
      case 'pdf':
        ForecastExporter.exportAsPDF(forecastData, portfolio, timeHorizon);
        break;
    }
    
    setShowExportMenu(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Portfolio Forecasting
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Analyze your portfolio's potential future performance using Monte Carlo simulations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Forecast Settings
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            {forecastData && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => exportForecast('json')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Export as JSON</span>
                      </button>
                      <button
                        onClick={() => exportForecast('csv')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Export as CSV</span>
                      </button>
                      <button
                        onClick={() => exportForecast('pdf')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <FileImage className="h-4 w-4" />
                        <span>Export as PDF</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={generateForecast}
              disabled={loading || portfolio.holdings.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{loading ? 'Generating...' : 'Generate Forecast'}</span>
            </button>
          </div>
        </div>


        {/* Progress Indicator */}
        {loading && progress.phase !== 'idle' && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-400">{progress.message}</span>
              <span className="text-sm text-blue-600 dark:text-blue-400">{progress.progress}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="max-w-xs">
          {/* Time Horizon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Horizon
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1_month">1 Month</option>
              <option value="3_months">3 Months</option>
              <option value="1_year">1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {forecastData && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Forecast Summary ({getTimeHorizonLabel(forecastData.summary.timeHorizon)})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(forecastData.summary.initialValue)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Value</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(forecastData.summary.finalProjectedValue)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Projected Value</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(forecastData.summary.totalProjectedGain)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Expected Gain/Loss</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatPercentage(forecastData.summary.annualizedReturn)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Annualized Return</div>
              </div>
            </div>
          </div>

          {/* Data Quality and Warnings */}
          {forecastData.metadata && (
            <div className="space-y-4">
              {/* Engine Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                      Professional Monte Carlo Engine v{forecastData.metadata.version}
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Real financial mathematics with historical data analysis
                    </p>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {new Date(forecastData.metadata.generated_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Data Quality Indicators */}
              {forecastData.metadata.dataQuality && (
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Data Quality Assessment</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Quality Score</div>
                      <div className={`font-medium ${
                        forecastData.metadata.dataQuality.overall_quality_score > 0.8 
                          ? 'text-green-600 dark:text-green-400' 
                          : forecastData.metadata.dataQuality.overall_quality_score > 0.6
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(forecastData.metadata.dataQuality.overall_quality_score * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Data Coverage</div>
                      <div className={`font-medium ${
                        forecastData.metadata.dataQuality.data_coverage > 0.9 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {(forecastData.metadata.dataQuality.data_coverage * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Assets with Data</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {forecastData.metadata.dataQuality.assets_with_data}/{forecastData.metadata.dataQuality.total_assets}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Engine</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {forecastData.metadata.engine === 'professional_monte_carlo' ? 'Professional' : 'Fallback'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {forecastData.metadata.warnings && forecastData.metadata.warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                        Data Quality Warnings
                      </h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {forecastData.metadata.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Monte Carlo Results */}
          {forecastData.monteCarloResults && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <MonteCarloChart
                  monteCarloResults={forecastData.monteCarloResults}
                  currentValue={forecastData.currentTotalValue}
                  timeHorizon={forecastData.summary.timeHorizon}
                />
              </div>
              <div className="xl:col-span-1">
                <MonteCarloInsights
                  insights={forecastData.summary.monteCarloInsights || []}
                  monteCarloResults={forecastData.monteCarloResults}
                  currentValue={forecastData.currentTotalValue}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!forecastData && !loading && portfolio.holdings.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Portfolio Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please add holdings to your portfolio to generate forecasts
          </p>
        </div>
      )}
    </div>
  );
}