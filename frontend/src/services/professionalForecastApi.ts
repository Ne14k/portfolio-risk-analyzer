// Professional Monte Carlo Forecast API Service

interface HoldingData {
  ticker: string;
  name: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

interface ProfessionalForecastRequest {
  holdings: HoldingData[];
  time_horizon: string;
  num_simulations?: number;
}

interface ProfessionalForecastResponse {
  status: string;
  forecast_data: {
    initial_value: number;
    time_horizon: string;
    time_horizon_days: number;
    num_simulations: number;
    percentile_data: Array<{
      date: string;
      day: number;
      percentile_5: number;
      percentile_25: number;
      percentile_50: number;
      percentile_75: number;
      percentile_95: number;
    }>;
    statistics: {
      mean_final_value: number;
      median_final_value: number;
      std_final_value: number;
      mean_return: number;
      median_return: number;
      std_return: number;
      min_return: number;
      max_return: number;
      percentiles: { [key: string]: number };
      sharpe_ratio: number;
      sortino_ratio: number;
      calmar_ratio: number;
      var_95: number;
      var_99: number;
      expected_shortfall_95: number;
      expected_shortfall_99: number;
      probability_positive: number;
      probability_loss_5_percent: number;
      probability_loss_10_percent: number;
      probability_gain_10_percent: number;
      probability_gain_20_percent: number;
      skewness: number;
      kurtosis: number;
      maximum_drawdown: number;
      downside_deviation: number;
    };
    data_quality: {
      overall_quality_score: number;
      data_coverage: number;
      assets_with_data: number;
      total_assets: number;
      quality_by_asset: { [ticker: string]: any };
    };
    risk_metrics: {
      value_at_risk_95: number;
      value_at_risk_99: number;
      expected_shortfall_95: number;
      expected_shortfall_99: number;
      maximum_drawdown: number;
      sharpe_ratio: number;
      sortino_ratio: number;
      probability_positive: number;
      probability_loss_10_percent: number;
      probability_gain_20_percent: number;
    };
  };
  metadata: {
    engine: string;
    version: string;
    generated_at: string;
    data_quality_warning: boolean;
    warnings: string[];
  };
}

export class ProfessionalForecastAPI {
  private static readonly BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://localhost:8000';

  static async generateForecast(request: {
    holdings: HoldingData[];
    timeHorizon: string;
    includeScenarios: boolean;
    includeMonteCarlo: boolean;
    monteCarloSimulations: number;
  }): Promise<any> {
    try {
      console.log('🚀 Calling professional Monte Carlo forecast API...');
      
      // Convert timeHorizon format
      const timeHorizonMap: { [key: string]: string } = {
        '1_month': '1_month',
        '3_months': '3_months', 
        '1_year': '1_year'
      };

      const professionalRequest: ProfessionalForecastRequest = {
        holdings: request.holdings,
        time_horizon: timeHorizonMap[request.timeHorizon] || '3_months',
        num_simulations: request.monteCarloSimulations || 10000
      };

      const response = await fetch(`${this.BASE_URL}/professional-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(professionalRequest)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: ProfessionalForecastResponse = await response.json();
      
      console.log('✅ Professional forecast received:', data);

      // Transform the professional API response to match the frontend expectations
      return this.transformToFrontendFormat(data, request);

    } catch (error) {
      console.error('❌ Professional forecast API error:', error);
      
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data generation...');
      return this.generateFallbackMockData(request);
    }
  }

  private static transformToFrontendFormat(
    data: ProfessionalForecastResponse, 
    originalRequest: any
  ): any {
    const { forecast_data } = data;
    
    // Transform percentile data to forecast data format
    const forecastData = forecast_data.percentile_data.map(point => ({
      date: point.date,
      totalValue: point.percentile_50, // Use median as main forecast
      gainLoss: point.percentile_50 - forecast_data.initial_value,
      gainLossPercentage: ((point.percentile_50 - forecast_data.initial_value) / forecast_data.initial_value) * 100
    }));

    // Create Monte Carlo results in expected format
    const monteCarloResults = {
      numSimulations: forecast_data.num_simulations,
      percentile5: forecast_data.percentile_data.map(p => p.percentile_5),
      percentile25: forecast_data.percentile_data.map(p => p.percentile_25),
      percentile50: forecast_data.percentile_data.map(p => p.percentile_50),
      percentile75: forecast_data.percentile_data.map(p => p.percentile_75),
      percentile95: forecast_data.percentile_data.map(p => p.percentile_95),
      probabilityPositive: forecast_data.statistics.probability_positive,
      probabilityLoss5Percent: forecast_data.statistics.probability_loss_5_percent,
      probabilityLoss10Percent: forecast_data.statistics.probability_loss_10_percent,
      probabilityGain10Percent: forecast_data.statistics.probability_gain_10_percent,
      probabilityGain20Percent: forecast_data.statistics.probability_gain_20_percent,
      expectedValue: forecast_data.statistics.mean_final_value,
      valueAtRisk5: forecast_data.statistics.var_95,
      valueAtRisk1: forecast_data.statistics.var_99,
      conditionalValueAtRisk: forecast_data.statistics.expected_shortfall_95,
      simulationSummary: {
        meanReturn: forecast_data.statistics.mean_return,
        volatility: forecast_data.statistics.std_return,
        sharpeRatio: forecast_data.statistics.sharpe_ratio,
        skewness: forecast_data.statistics.skewness,
        kurtosis: forecast_data.statistics.kurtosis,
        downsideDeviation: forecast_data.statistics.downside_deviation,
        maximumDrawdown: forecast_data.statistics.maximum_drawdown,
        confidenceIntervals: {},
        riskMetrics: forecast_data.risk_metrics
      }
    };

    // Generate insights from professional data
    const insights = this.generateProfessionalInsights(forecast_data.statistics, forecast_data.initial_value);

    // Use expected value from Monte Carlo statistics, not median from time series
    const finalValue = forecast_data.statistics.mean_final_value;
    const totalGain = finalValue - forecast_data.initial_value;
    const gainPercentage = (totalGain / forecast_data.initial_value) * 100;
    
    // Use the backend's mean_return directly for annualized calculation (it's already a decimal)
    const totalReturnDecimal = forecast_data.statistics.mean_return;

    return {
      currentTotalValue: forecast_data.initial_value,
      forecastData,
      individualAssets: this.generateMockAssetForecasts(originalRequest.holdings, forecast_data.time_horizon_days),
      monteCarloResults,
      summary: {
        timeHorizon: originalRequest.timeHorizon,
        initialValue: forecast_data.initial_value,
        finalProjectedValue: finalValue,
        totalProjectedGain: totalGain,
        totalProjectedGainPercentage: gainPercentage,
        annualizedReturn: (finalValue / forecast_data.initial_value) - 1,
        forecastGeneratedAt: data.metadata.generated_at,
        monteCarloInsights: insights
      },
      metadata: {
        ...data.metadata,
        dataQuality: forecast_data.data_quality,
        warnings: data.metadata.warnings
      }
    };
  }

  private static generateProfessionalInsights(statistics: any, initialValue: number): string[] {
    const insights = [];
    
    // Probability insights
    if (statistics.probability_positive > 0.7) {
      insights.push(`🎯 High probability of positive returns: ${(statistics.probability_positive * 100).toFixed(1)}% chance of gains`);
    } else if (statistics.probability_positive < 0.4) {
      insights.push(`⚠️ Lower probability of positive returns: ${(statistics.probability_positive * 100).toFixed(1)}% chance of gains`);
    }

    // Risk insights
    if (statistics.probability_loss_10_percent > 0.2) {
      insights.push(`🔻 Significant downside risk: ${(statistics.probability_loss_10_percent * 100).toFixed(1)}% chance of losing 10% or more`);
    }

    if (statistics.probability_gain_20_percent > 0.25) {
      insights.push(`🚀 Strong upside potential: ${(statistics.probability_gain_20_percent * 100).toFixed(1)}% chance of gaining 20% or more`);
    }

    // Expected return insights
    const expectedReturnPct = (statistics.mean_return * 100);
    if (expectedReturnPct > 5) {
      insights.push(`📈 Positive expected outcome: Average projected return of ${expectedReturnPct.toFixed(1)}%`);
    } else if (expectedReturnPct < -2) {
      insights.push(`📉 Negative expected outcome: Average projected return of ${expectedReturnPct.toFixed(1)}%`);
    }

    // Volatility insights
    if (statistics.std_return > 0.3) {
      insights.push("🌪️ High volatility expected: Wide range of possible outcomes");
    } else if (statistics.std_return < 0.1) {
      insights.push("📊 Low volatility expected: Relatively stable outcomes");
    }

    // Sharpe ratio insights
    if (statistics.sharpe_ratio > 1.0) {
      insights.push("⭐ Excellent risk-adjusted returns expected");
    } else if (statistics.sharpe_ratio < 0.5) {
      insights.push("📉 Poor risk-adjusted returns expected");
    }

    // VaR insights
    const var95Loss = ((initialValue - statistics.var_95) / initialValue) * 100;
    if (var95Loss > 10) {
      insights.push(`⚠️ High tail risk: 5% chance of losing ${var95Loss.toFixed(1)}% or more (worst 5% of outcomes)`);
    }

    // Skewness insights
    if (statistics.skewness > 0.5) {
      insights.push("📈 Positively skewed outcomes: More upside potential than downside risk");
    } else if (statistics.skewness < -0.5) {
      insights.push("📉 Negatively skewed outcomes: More downside risk than upside potential");
    }

    return insights.slice(0, 8); // Limit to 8 most relevant insights
  }

  private static generateMockAssetForecasts(holdings: HoldingData[], days: number) {
    // Generate simplified asset forecasts for individual holdings
    return holdings.map(holding => {
      const forecastedPrices = [];
      let currentPrice = holding.currentPrice;
      const baseDate = new Date();

      for (let i = 1; i <= Math.min(days, 30); i++) { // Limit to 30 points for performance
        const dailyReturn = (Math.random() - 0.5) * 0.04; // ±2% daily range
        currentPrice *= (1 + dailyReturn);
        currentPrice = Math.max(currentPrice, 0.01);

        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i * Math.ceil(days / 30));

        forecastedPrices.push({
          date: date.toISOString().split('T')[0],
          predictedPrice: Math.round(currentPrice * 100) / 100,
          portfolioValueContribution: Math.round(currentPrice * holding.quantity * 100) / 100
        });
      }

      return {
        ticker: holding.ticker,
        currentPrice: holding.currentPrice,
        forecastedPrices
      };
    });
  }


  private static generateFallbackMockData(request: any): any {
    console.log('📊 Generating fallback mock data...');
    
    // Simple fallback when API is unavailable
    const currentTotalValue = request.holdings.reduce((sum: number, h: HoldingData) => sum + h.marketValue, 0);
    
    // Generate basic mock data
    const timeHorizonDays = this.getTimeHorizonDays(request.timeHorizon);
    const forecastData = this.generateSimpleForecastData(currentTotalValue, timeHorizonDays);
    
    const finalValue = forecastData[forecastData.length - 1].totalValue;
    const totalGain = finalValue - currentTotalValue;
    const gainPercentage = (totalGain / currentTotalValue) * 100;

    return {
      currentTotalValue,
      forecastData,
      individualAssets: this.generateMockAssetForecasts(request.holdings, timeHorizonDays),
      monteCarloResults: request.includeMonteCarlo ? this.generateSimpleMonteCarloResults(currentTotalValue, request.monteCarloSimulations) : undefined,
      summary: {
        timeHorizon: request.timeHorizon,
        initialValue: currentTotalValue,
        finalProjectedValue: finalValue,
        totalProjectedGain: totalGain,
        totalProjectedGainPercentage: gainPercentage,
        annualizedReturn: (finalValue / currentTotalValue) - 1,
        forecastGeneratedAt: new Date().toISOString(),
        monteCarloInsights: ["📊 Using simplified mock data - API unavailable"]
      },
      metadata: {
        engine: 'fallback_mock',
        version: '1.0',
        generated_at: new Date().toISOString(),
        warnings: ['Professional API unavailable - using simplified mock data']
      }
    };
  }

  private static getTimeHorizonDays(timeHorizon: string): number {
    const mapping = {
      '1_month': 30,
      '3_months': 90,
      '1_year': 365
    };
    return mapping[timeHorizon as keyof typeof mapping] || 90;
  }

  private static generateSimpleForecastData(initialValue: number, days: number) {
    const data = [];
    let currentValue = initialValue;
    const baseDate = new Date();

    for (let i = 1; i <= days; i++) {
      const dailyReturn = Math.random() * 0.02 - 0.005; // -0.5% to +1.5% daily
      currentValue *= (1 + dailyReturn);
      
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);

      data.push({
        date: date.toISOString().split('T')[0],
        totalValue: Math.round(currentValue * 100) / 100,
        gainLoss: Math.round((currentValue - initialValue) * 100) / 100,
        gainLossPercentage: Math.round(((currentValue - initialValue) / initialValue) * 100 * 100) / 100
      });
    }

    return data;
  }

  private static generateSimpleMonteCarloResults(initialValue: number, numSimulations: number) {
    const days = 30; // Simplified for fallback
    const percentiles = [5, 25, 50, 75, 95];
    const results: any = { numSimulations };

    percentiles.forEach(p => {
      const key = `percentile${p}`;
      const values = [];
      let base = initialValue * (0.8 + (p / 100) * 0.4); // Scale by percentile
      
      for (let i = 0; i <= days; i++) {
        if (i === 0) {
          values.push(initialValue);
        } else {
          base *= (1 + (Math.random() - 0.5) * 0.02);
          values.push(Math.round(base * 100) / 100);
        }
      }
      results[key] = values;
    });

    return {
      ...results,
      probabilityPositive: 0.6,
      probabilityLoss5Percent: 0.2,
      probabilityLoss10Percent: 0.1,
      probabilityGain10Percent: 0.3,
      probabilityGain20Percent: 0.15,
      expectedValue: results.percentile50[results.percentile50.length - 1],
      valueAtRisk5: results.percentile5[results.percentile5.length - 1],
      valueAtRisk1: results.percentile5[results.percentile5.length - 1] * 0.9,
      conditionalValueAtRisk: results.percentile5[results.percentile5.length - 1] * 0.85,
      simulationSummary: {
        meanReturn: 0.05,
        volatility: 0.15,
        sharpeRatio: 0.6,
        skewness: 0.1,
        kurtosis: 3.0,
        downsideDeviation: 0.1,
        maximumDrawdown: -0.15
      }
    };
  }
}