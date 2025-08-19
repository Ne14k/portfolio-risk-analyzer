import { Portfolio } from '../types/portfolio';

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
}

export class ForecastExporter {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  private static formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-CA');
  }

  // Export as JSON
  static exportAsJSON(forecastData: ForecastData, portfolio: Portfolio, timeHorizon: string): void {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportType: 'portfolio_forecast',
        version: '1.0',
        timeHorizon: timeHorizon,
        portfolioSnapshot: {
          totalValue: portfolio.totalValue,
          holdingsCount: portfolio.holdings.length,
          lastUpdated: portfolio.lastUpdated
        }
      },
      portfolio: {
        holdings: portfolio.holdings.map(h => ({
          ticker: h.ticker,
          name: h.name,
          quantity: h.quantity,
          currentPrice: h.currentPrice,
          marketValue: h.quantity * h.currentPrice,
          category: h.category
        })),
        assetAllocation: portfolio.assetAllocation
      },
      forecast: forecastData
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const fileName = `portfolio-forecast-${timeHorizon}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  }

  // Export as CSV
  static exportAsCSV(forecastData: ForecastData, portfolio: Portfolio, timeHorizon: string): void {
    const csvRows: string[] = [];
    
    // Header
    csvRows.push('Portfolio Forecast Export');
    csvRows.push(`Exported: ${new Date().toLocaleString('en-CA')}`);
    csvRows.push(`Time Horizon: ${timeHorizon}`);
    csvRows.push('');

    // Portfolio Summary
    csvRows.push('Portfolio Summary');
    csvRows.push('Current Value,Projected Value,Expected Gain/Loss,Gain/Loss %,Annualized Return');
    csvRows.push([
      this.formatCurrency(forecastData.summary.initialValue),
      this.formatCurrency(forecastData.summary.finalProjectedValue),
      this.formatCurrency(forecastData.summary.totalProjectedGain),
      this.formatPercentage(forecastData.summary.totalProjectedGainPercentage),
      this.formatPercentage(forecastData.summary.annualizedReturn)
    ].join(','));
    csvRows.push('');

    // Monte Carlo Results (if available)
    if (forecastData.monteCarloResults) {
      const mc = forecastData.monteCarloResults;
      csvRows.push('Monte Carlo Results');
      csvRows.push('Metric,Value');
      csvRows.push(`Number of Simulations,${mc.numSimulations}`);
      csvRows.push(`Expected Value,${this.formatCurrency(mc.expectedValue)}`);
      csvRows.push(`Probability of Gains,${(mc.probabilityPositive * 100).toFixed(1)}%`);
      csvRows.push(`Probability of 5%+ Loss,${(mc.probabilityLoss5Percent * 100).toFixed(1)}%`);
      csvRows.push(`Probability of 10%+ Loss,${(mc.probabilityLoss10Percent * 100).toFixed(1)}%`);
      csvRows.push(`Probability of 10%+ Gain,${(mc.probabilityGain10Percent * 100).toFixed(1)}%`);
      csvRows.push(`Probability of 20%+ Gain,${(mc.probabilityGain20Percent * 100).toFixed(1)}%`);
      csvRows.push(`Value at Risk (5%),${this.formatCurrency(mc.valueAtRisk5)}`);
      csvRows.push(`Value at Risk (1%),${this.formatCurrency(mc.valueAtRisk1)}`);
      csvRows.push(`Sharpe Ratio,${mc.simulationSummary.sharpeRatio.toFixed(3)}`);
      csvRows.push(`Volatility,${(mc.simulationSummary.volatility * 100).toFixed(2)}%`);
      csvRows.push('');
    }

    // Portfolio Forecast Timeline
    csvRows.push('Forecast Timeline');
    csvRows.push('Date,Portfolio Value,Gain/Loss,Gain/Loss %');
    forecastData.forecastData.forEach(point => {
      csvRows.push([
        this.formatDate(point.date),
        this.formatCurrency(point.totalValue),
        this.formatCurrency(point.gainLoss),
        this.formatPercentage(point.gainLossPercentage)
      ].join(','));
    });
    csvRows.push('');

    // Current Holdings
    csvRows.push('Current Holdings');
    csvRows.push('Ticker,Name,Quantity,Current Price,Market Value,Category');
    portfolio.holdings.forEach(holding => {
      csvRows.push([
        holding.ticker,
        `"${holding.name}"`,
        holding.quantity.toString(),
        this.formatCurrency(holding.currentPrice),
        this.formatCurrency(holding.quantity * holding.currentPrice),
        holding.category
      ].join(','));
    });

    const csvContent = csvRows.join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
    
    const fileName = `portfolio-forecast-${timeHorizon}-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  }

  // Export as PDF (simplified text version)
  static exportAsPDF(forecastData: ForecastData, portfolio: Portfolio, timeHorizon: string): void {
    // Create a formatted text document that can be saved as PDF
    const content = this.generateReportContent(forecastData, portfolio, timeHorizon);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Portfolio Forecast Report - ${timeHorizon}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
              color: #333;
            }
            h1, h2, h3 { color: #2563eb; }
            .summary-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .summary-table th, .summary-table td { 
              padding: 12px; 
              text-align: left; 
              border-bottom: 1px solid #ddd; 
            }
            .summary-table th { 
              background-color: #f8f9fa; 
              font-weight: bold; 
            }
            .metric { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0; 
              border-bottom: 1px solid #eee; 
            }
            .insight { 
              background-color: #f0f9ff; 
              padding: 12px; 
              margin: 8px 0; 
              border-left: 4px solid #2563eb; 
              border-radius: 4px; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${content}
          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
              Print / Save as PDF
            </button>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  private static generateReportContent(forecastData: ForecastData, portfolio: Portfolio, timeHorizon: string): string {
    const timeHorizonLabel = timeHorizon.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    let content = `
      <h1>Portfolio Forecast Report</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleString('en-CA')}</p>
      <p><strong>Time Horizon:</strong> ${timeHorizonLabel}</p>
      
      <h2>Executive Summary</h2>
      <table class="summary-table">
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Current Portfolio Value</td>
          <td>${this.formatCurrency(forecastData.summary.initialValue)}</td>
        </tr>
        <tr>
          <td>Projected Value</td>
          <td>${this.formatCurrency(forecastData.summary.finalProjectedValue)}</td>
        </tr>
        <tr>
          <td>Expected Gain/Loss</td>
          <td>${this.formatCurrency(forecastData.summary.totalProjectedGain)}</td>
        </tr>
        <tr>
          <td>Gain/Loss Percentage</td>
          <td>${this.formatPercentage(forecastData.summary.totalProjectedGainPercentage)}</td>
        </tr>
        <tr>
          <td>Annualized Return</td>
          <td>${this.formatPercentage(forecastData.summary.annualizedReturn)}</td>
        </tr>
      </table>
    `;

    // Monte Carlo Results
    if (forecastData.monteCarloResults) {
      const mc = forecastData.monteCarloResults;
      content += `
        <h2>Monte Carlo Simulation Results</h2>
        <p><strong>Number of Simulations:</strong> ${mc.numSimulations.toLocaleString()}</p>
        
        <h3>Probability Analysis</h3>
        <div class="metric">
          <span>Probability of Positive Returns</span>
          <span>${(mc.probabilityPositive * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>Probability of 10%+ Gain</span>
          <span>${(mc.probabilityGain10Percent * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>Probability of 20%+ Gain</span>
          <span>${(mc.probabilityGain20Percent * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>Probability of 5%+ Loss</span>
          <span>${(mc.probabilityLoss5Percent * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>Probability of 10%+ Loss</span>
          <span>${(mc.probabilityLoss10Percent * 100).toFixed(1)}%</span>
        </div>
        
        <h3>Risk Metrics</h3>
        <div class="metric">
          <span>Expected Value</span>
          <span>${this.formatCurrency(mc.expectedValue)}</span>
        </div>
        <div class="metric">
          <span>Value at Risk (5%)</span>
          <span>${this.formatCurrency(mc.valueAtRisk5)}</span>
        </div>
        <div class="metric">
          <span>Value at Risk (1%)</span>
          <span>${this.formatCurrency(mc.valueAtRisk1)}</span>
        </div>
        <div class="metric">
          <span>Sharpe Ratio</span>
          <span>${mc.simulationSummary.sharpeRatio.toFixed(3)}</span>
        </div>
        <div class="metric">
          <span>Volatility</span>
          <span>${(mc.simulationSummary.volatility * 100).toFixed(2)}%</span>
        </div>
        <div class="metric">
          <span>Skewness</span>
          <span>${mc.simulationSummary.skewness.toFixed(3)}</span>
        </div>
      `;

      // Insights
      if (forecastData.summary.monteCarloInsights && forecastData.summary.monteCarloInsights.length > 0) {
        content += `
          <h3>Key Insights</h3>
        `;
        forecastData.summary.monteCarloInsights.forEach(insight => {
          const cleanInsight = insight.replace(/^[🎯⚠️🚀📉📊⭐🌪️📈]+\s*/, '');
          content += `<div class="insight">${cleanInsight}</div>`;
        });
      }
    }

    // Current Holdings
    content += `
      <h2>Current Portfolio Holdings</h2>
      <table class="summary-table">
        <tr>
          <th>Ticker</th>
          <th>Name</th>
          <th>Quantity</th>
          <th>Current Price</th>
          <th>Market Value</th>
          <th>Category</th>
        </tr>
    `;
    
    portfolio.holdings.forEach(holding => {
      content += `
        <tr>
          <td>${holding.ticker}</td>
          <td>${holding.name}</td>
          <td>${holding.quantity.toLocaleString()}</td>
          <td>${this.formatCurrency(holding.currentPrice)}</td>
          <td>${this.formatCurrency(holding.quantity * holding.currentPrice)}</td>
          <td>${holding.category}</td>
        </tr>
      `;
    });
    
    content += `
      </table>
      
      <h2>Disclaimer</h2>
      <p><em>This forecast is for educational and informational purposes only. Past performance does not guarantee future results. All investments carry risk of loss. Please consult with a qualified financial advisor before making investment decisions.</em></p>
    `;

    return content;
  }
}