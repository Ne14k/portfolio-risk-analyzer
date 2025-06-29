import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { RiskMetrics } from '../types';

interface RiskReturnChartProps {
  currentMetrics: RiskMetrics;
  optimizedMetrics: RiskMetrics;
}

export const RiskReturnChart: React.FC<RiskReturnChartProps> = ({
  currentMetrics,
  optimizedMetrics,
}) => {
  const data = [
    {
      name: 'Current Portfolio',
      risk: currentMetrics.volatility,
      return: currentMetrics.expected_return,
      fill: '#ef4444',
    },
    {
      name: 'Optimized Portfolio',
      risk: optimizedMetrics.volatility,
      return: optimizedMetrics.expected_return,
      fill: '#10b981',
    },
  ];

  // Calculate normalized chart domains with proper intervals
  const allRisks = data.map(d => d.risk);
  const allReturns = data.map(d => d.return);
  
  const minRisk = Math.min(...allRisks);
  const maxRisk = Math.max(...allRisks);
  const minReturn = Math.min(...allReturns);
  const maxReturn = Math.max(...allReturns);
  
  // Create normalized domains starting from 0,0 with nice round numbers
  const createNiceDomain = (min: number, max: number, interval: number = 1, startFromZero: boolean = false) => {
    if (startFromZero) {
      const domainMax = Math.ceil((max + interval) / interval) * interval;
      return [0, domainMax];
    } else {
      const padding = interval * 2; // 2 intervals of padding
      const domainMin = Math.floor((min - padding) / interval) * interval;
      const domainMax = Math.ceil((max + padding) / interval) * interval;
      return [Math.max(0, domainMin), domainMax]; // Risk can't be negative
    }
  };
  
  // Use 1% intervals for risk and 1% intervals for return, starting from 0
  const riskDomain = createNiceDomain(minRisk, maxRisk, 1, true);
  const returnDomain = createNiceDomain(minReturn, maxReturn, 1, true);
  
  // Generate tick values for clean grid lines
  const generateTicks = (domain: number[], interval: number, isYAxis: boolean = false) => {
    const ticks = [];
    for (let i = domain[0]; i <= domain[1]; i += interval) {
      // For Y-axis, skip 0 to avoid duplicate with X-axis origin
      if (isYAxis && i === 0) continue;
      ticks.push(i);
    }
    return ticks;
  };
  
  const riskTicks = generateTicks(riskDomain, 1, false); // X-axis includes 0
  const returnTicks = generateTicks(returnDomain, 1, true); // Y-axis excludes 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Calculate practical risk impact
      const getRiskDescription = (risk: number) => {
        if (risk < 5) return "Very Low Risk";
        if (risk < 10) return "Low Risk";
        if (risk < 15) return "Moderate Risk";
        if (risk < 20) return "High Risk";
        return "Very High Risk";
      };
      
      const getPotentialLoss = (risk: number) => {
        // Approximate 1-year potential loss (1 standard deviation)
        const loss = Math.round(risk);
        return `${loss}%`;
      };
      
      const getWorstCaseLoss = (risk: number) => {
        // Approximate worst-case scenario (2 standard deviations)
        const worstCase = Math.round(risk * 2);
        return `${worstCase}%`;
      };

      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Expected Return: <span className="font-medium text-green-600">{data.return.toFixed(1)}%</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Volatility: <span className="font-medium">{data.risk.toFixed(1)}%</span> ({getRiskDescription(data.risk)})
            </p>
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Potential Impact:</strong>
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                • Typical year loss: up to {getPotentialLoss(data.risk)}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                • Bad year loss: up to {getWorstCaseLoss(data.risk)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
        Risk vs Return Analysis
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart 
          data={data}
          margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
          
          {/* Risk zones background */}
          <ReferenceArea
            x1={0}
            x2={Math.min(10, riskDomain[1])}
            y1={0}
            y2={returnDomain[1]}
            fill="rgba(34, 197, 94, 0.1)"
            stroke="none"
          />
          {riskDomain[1] > 10 && (
            <ReferenceArea
              x1={10}
              x2={Math.min(20, riskDomain[1])}
              y1={0}
              y2={returnDomain[1]}
              fill="rgba(245, 158, 11, 0.1)"
              stroke="none"
            />
          )}
          {riskDomain[1] > 20 && (
            <ReferenceArea
              x1={20}
              x2={riskDomain[1]}
              y1={0}
              y2={returnDomain[1]}
              fill="rgba(239, 68, 68, 0.1)"
              stroke="none"
            />
          )}
          
          <XAxis
            type="number"
            dataKey="risk"
            name="Risk (Volatility)"
            unit="%"
            domain={riskDomain}
            ticks={riskTicks}
            className="text-gray-600 dark:text-gray-400"
            label={{ 
              value: 'Risk (Volatility %)', 
              position: 'insideBottom', 
              offset: -5,
              style: { textAnchor: 'middle' }
            }}
          />
          <YAxis
            type="number"
            dataKey="return"
            name="Expected Return"
            unit="%"
            domain={returnDomain}
            ticks={returnTicks}
            className="text-gray-600 dark:text-gray-400"
            label={{ 
              value: 'Expected Return (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter 
            data={data} 
            fill="#8884d8"
          />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-3">
        {/* Portfolio Legend */}
        <div className="flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Optimized</span>
          </div>
        </div>
        
        {/* Risk Zone Legend */}
        <div className="flex justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-3 bg-green-500 bg-opacity-20 border border-green-300 mr-1"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Low Risk (0-10%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-3 bg-amber-500 bg-opacity-20 border border-amber-300 mr-1"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Moderate (10-20%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-3 bg-red-500 bg-opacity-20 border border-red-300 mr-1"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">High Risk (20%+)</span>
          </div>
        </div>
      </div>
      
      {/* Risk Education */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Understanding Risk</h4>
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <p><strong>Higher risk means bigger swings:</strong> A 15% risk portfolio could lose 15% in a typical bad year, or 30% in a really bad year.</p>
          <p><strong>Example:</strong> $100,000 at 10% risk → potential loss of $10,000-$20,000 during market downturns.</p>
          <p><strong>Trade-off:</strong> Higher risk usually means higher long-term returns, but more stress and potential short-term losses.</p>
        </div>
      </div>
    </div>
  );
};