// Mock API for testing Monte Carlo forecasting functionality

interface HoldingData {
  ticker: string;
  name: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

interface ForecastRequest {
  holdings: HoldingData[];
  timeHorizon: string;
  includeScenarios: boolean;
  includeMonteCarlo: boolean;
  monteCarloSimulations: number;
}

export class MockForecastAPI {
  static async generateForecast(request: ForecastRequest): Promise<any> {
    // Simulate API delay
    await this.delay(2000 + Math.random() * 3000);

    const currentTotalValue = request.holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const timeHorizonDays = this.getTimeHorizonDays(request.timeHorizon);
    
    // Generate mock forecast data
    const forecastData = this.generateMockForecastData(currentTotalValue, timeHorizonDays);
    const monteCarloResults = request.includeMonteCarlo ? 
      this.generateMockMonteCarloResults(currentTotalValue, request.monteCarloSimulations, request.timeHorizon) : 
      undefined;

    const finalValue = forecastData[forecastData.length - 1].totalValue;
    const totalGain = finalValue - currentTotalValue;
    const gainPercentage = (totalGain / currentTotalValue) * 100;

    return {
      currentTotalValue,
      forecastData,
      individualAssets: request.holdings.map(h => this.generateAssetForecast(h, timeHorizonDays)),
      monteCarloResults,
      summary: {
        timeHorizon: request.timeHorizon,
        initialValue: currentTotalValue,
        finalProjectedValue: finalValue,
        totalProjectedGain: totalGain,
        totalProjectedGainPercentage: gainPercentage,
        annualizedReturn: (finalValue / currentTotalValue) - 1,
        forecastGeneratedAt: new Date().toISOString(),
        monteCarloInsights: monteCarloResults ? this.generateInsights(monteCarloResults, currentTotalValue) : []
      }
    };
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static getTimeHorizonDays(timeHorizon: string): number {
    const mapping = {
      '1_month': 30,
      '3_months': 90,
      '1_year': 365
    };
    return mapping[timeHorizon as keyof typeof mapping] || 90;
  }

  private static generateMockForecastData(initialValue: number, days: number) {
    const data = [];
    let currentValue = initialValue;
    const baseDate = new Date();

    for (let i = 1; i <= days; i++) {
      // Simple random walk with slight upward bias
      const dailyReturn = Math.random() * 0.04 - 0.015; // -1.5% to +2.5% daily range
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

  private static generateAssetForecast(holding: HoldingData, days: number) {
    const forecastedPrices = [];
    let currentPrice = holding.currentPrice;
    const baseDate = new Date();

    for (let i = 1; i <= days; i++) {
      const dailyReturn = Math.random() * 0.06 - 0.02; // -2% to +4% daily range for individual stocks
      currentPrice *= (1 + dailyReturn);
      currentPrice = Math.max(currentPrice, 0.01); // Prevent negative prices

      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);

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
  }

  private static generateMockMonteCarloResults(initialValue: number, numSimulations: number, timeHorizon: string = '3_months') {
    const totalDays = this.getTimeHorizonDays(timeHorizon);
    // For performance, sample data points for longer periods
    const sampleDays = timeHorizon === '1_year' ? 52 : totalDays;
    const dayStep = Math.max(1, Math.floor(totalDays / sampleDays));
    
    // Generate percentile data
    const percentile5 = [];
    const percentile25 = [];
    const percentile50 = [];
    const percentile75 = [];
    const percentile95 = [];

    let base5 = initialValue * 0.85;
    let base25 = initialValue * 0.92;
    let base50 = initialValue * 1.03;
    let base75 = initialValue * 1.15;
    let base95 = initialValue * 1.28;

    for (let i = 0; i <= sampleDays; i++) {
      const day = i * dayStep;
      if (day === 0) {
        percentile5.push(initialValue);
        percentile25.push(initialValue);
        percentile50.push(initialValue);
        percentile75.push(initialValue);
        percentile95.push(initialValue);
      } else {
        // Scale the daily return for the time step
        const stepScale = dayStep;
        base5 *= Math.pow(1 + (Math.random() * 0.03 - 0.02), stepScale);
        base25 *= Math.pow(1 + (Math.random() * 0.025 - 0.01), stepScale);
        base50 *= Math.pow(1 + (Math.random() * 0.02 - 0.005), stepScale);
        base75 *= Math.pow(1 + (Math.random() * 0.025 + 0.005), stepScale);
        base95 *= Math.pow(1 + (Math.random() * 0.03 + 0.01), stepScale);

        percentile5.push(Math.round(base5 * 100) / 100);
        percentile25.push(Math.round(base25 * 100) / 100);
        percentile50.push(Math.round(base50 * 100) / 100);
        percentile75.push(Math.round(base75 * 100) / 100);
        percentile95.push(Math.round(base95 * 100) / 100);
      }
    }

    const expectedValue = base50;
    const var5 = base5 * 0.95;
    const var1 = base5 * 0.88;

    return {
      numSimulations,
      percentile5,
      percentile25,
      percentile50,
      percentile75,
      percentile95,
      probabilityPositive: 0.62 + Math.random() * 0.2,
      probabilityLoss5Percent: 0.15 + Math.random() * 0.15,
      probabilityLoss10Percent: 0.08 + Math.random() * 0.12,
      probabilityGain10Percent: 0.25 + Math.random() * 0.2,
      probabilityGain20Percent: 0.12 + Math.random() * 0.15,
      expectedValue: Math.round(expectedValue * 100) / 100,
      valueAtRisk5: Math.round(var5 * 100) / 100,
      valueAtRisk1: Math.round(var1 * 100) / 100,
      conditionalValueAtRisk: Math.round(var1 * 0.92 * 100) / 100,
      simulationSummary: {
        meanReturn: (expectedValue - initialValue) / initialValue,
        volatility: 0.15 + Math.random() * 0.2,
        sharpeRatio: 0.5 + Math.random() * 0.8,
        skewness: -0.2 + Math.random() * 0.6,
        kurtosis: 2.5 + Math.random() * 1.5,
        downsideDeviation: 0.08 + Math.random() * 0.12,
        maximumDrawdown: -0.12 - Math.random() * 0.08
      }
    };
  }


  private static generateInsights(monteCarloResults: any, initialValue: number): string[] {
    const insights = [];
    
    if (monteCarloResults.probabilityPositive > 0.7) {
      insights.push("🎯 High probability of positive returns with strong upside potential");
    } else if (monteCarloResults.probabilityPositive < 0.4) {
      insights.push("⚠️ Lower probability of gains - consider risk management strategies");
    }

    if (monteCarloResults.probabilityLoss10Percent > 0.2) {
      insights.push("🔻 Significant downside risk detected in worst-case scenarios");
    }

    if (monteCarloResults.probabilityGain20Percent > 0.25) {
      insights.push("🚀 Strong upside potential with significant chance of large gains");
    }

    if (monteCarloResults.simulationSummary.volatility > 0.25) {
      insights.push("🌪️ High volatility expected - prepare for significant price swings");
    } else if (monteCarloResults.simulationSummary.volatility < 0.1) {
      insights.push("📊 Low volatility forecast indicates stable expected returns");
    }

    if (monteCarloResults.simulationSummary.sharpeRatio > 1.0) {
      insights.push("⭐ Excellent risk-adjusted returns projected");
    } else if (monteCarloResults.simulationSummary.sharpeRatio < 0.5) {
      insights.push("📉 Poor risk-adjusted returns - consider portfolio rebalancing");
    }

    const expectedReturn = ((monteCarloResults.expectedValue - initialValue) / initialValue) * 100;
    if (expectedReturn > 5) {
      insights.push(`📈 Positive expected outcome with ${expectedReturn.toFixed(1)}% projected return`);
    }

    if (monteCarloResults.simulationSummary.skewness > 0.3) {
      insights.push("📈 Positively skewed outcomes favor upside over downside scenarios");
    }

    return insights.slice(0, 6); // Return up to 6 insights
  }
}