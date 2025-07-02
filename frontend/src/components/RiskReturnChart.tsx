import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Cell } from 'recharts';
import { RiskMetrics } from '../types';

interface RiskReturnChartProps {
  currentMetrics: RiskMetrics;
  optimizedMetrics: RiskMetrics;
}

export const RiskReturnChart = React.memo<RiskReturnChartProps>(({
  currentMetrics,
  optimizedMetrics,
}) => {
  const data = useMemo(() => [
    {
      name: 'Current Portfolio',
      risk: currentMetrics.volatility,
      return: currentMetrics.expected_return,
      fill: '#f59e0b',
    },
    {
      name: 'Optimized Portfolio',
      risk: optimizedMetrics.volatility,
      return: optimizedMetrics.expected_return,
      fill: '#22c55e',
    },
  ], [currentMetrics, optimizedMetrics]);

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
        <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg max-w-sm animate-in">
          <p className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-center">{data.name}</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Expected Return:</span>
              <span className="font-bold text-green-600 dark:text-green-400">{data.return.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Volatility:</span>
              <span className="font-bold text-gray-600 dark:text-gray-400">{data.risk.toFixed(1)}%</span>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Risk Level: <span className="text-primary-600 dark:text-primary-400">{getRiskDescription(data.risk)}</span>
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Potential Impact:
              </p>
              <div className="space-y-1">
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  Typical loss: up to {getPotentialLoss(data.risk)}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Worst case: up to {getWorstCaseLoss(data.risk)}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-gradient dark:card-gradient-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm animate-in">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        Risk vs Return Analysis
      </h3>
      <ResponsiveContainer width="100%" height={450}>
        <ScatterChart 
          data={data}
          margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300/60 dark:stroke-gray-600/60" strokeWidth={1} />
          
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
            r={8}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-3">
        {/* Portfolio Legend */}
        <div className="flex justify-center space-x-8">
          <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
            <div className="w-4 h-4 bg-amber-500 rounded-full mr-3 shadow-lg"></div>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Current Portfolio</span>
          </div>
          <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3 shadow-lg"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Optimized Portfolio</span>
          </div>
        </div>
        
        {/* Risk Zone Legend */}
        <div className="flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-5 h-3 bg-green-400/30 border border-green-400/50 rounded mr-2"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Low Risk (0-10%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-3 bg-amber-400/30 border border-amber-400/50 rounded mr-2"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Moderate (10-20%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-3 bg-red-400/30 border border-red-400/50 rounded mr-2"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">High Risk (20%+)</span>
          </div>
        </div>
      </div>
      
      {/* Understanding Risk Container */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Understanding Risk
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Risk Impact */}
            <div className="p-4 rounded-xl border border-gray-300 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">📊</span>
                <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Risk Impact</h5>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                <strong>Higher risk means bigger swings:</strong> A 15% risk portfolio could lose 15% in a typical bad year, or 30% in a really bad year.
              </p>
            </div>

            {/* Real Example */}
            <div className="p-4 rounded-xl border border-gray-300 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">💰</span>
                <h5 className="text-sm font-semibold text-green-800 dark:text-green-200">Real Example</h5>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                <strong>$100,000 at 10% risk</strong> → potential loss of $10,000-$20,000 during market downturns.
              </p>
            </div>

            {/* Risk-Return Trade-off */}
            <div className="p-4 rounded-xl border border-gray-300 dark:border-gray-600">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">⚖️</span>
                <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Trade-off</h5>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                <strong>Higher risk usually means higher long-term returns,</strong> but more stress and potential short-term losses.
              </p>
            </div>

          </div>


        </div>
      </div>
    </div>
  );
});