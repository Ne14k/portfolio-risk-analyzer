import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  SortAsc,
  SortDesc,
  PieChart,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { PortfolioHolding, PortfolioSummary } from '../types/plaid';
import { formatCurrency, formatPercentage, getGainLossColor } from '../services/plaid';

interface PortfolioHoldingsProps {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
  loading?: boolean;
}

type SortField = 'name' | 'value' | 'gain_loss' | 'allocation' | 'quantity';
type SortDirection = 'asc' | 'desc';

export function PortfolioHoldings({ holdings, summary, loading = false }: PortfolioHoldingsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [hideValues, setHideValues] = useState(false);

  // Filter and sort holdings
  const filteredAndSortedHoldings = useMemo(() => {
    let filtered = holdings.filter(holding => {
      const matchesSearch = holding.security.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (holding.security.ticker_symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesFilter = filterType === 'all' || 
                           holding.security.type.toLowerCase().includes(filterType.toLowerCase());
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'name':
          aValue = a.security.name;
          bValue = b.security.name;
          break;
        case 'value':
          aValue = a.market_value;
          bValue = b.market_value;
          break;
        case 'gain_loss':
          aValue = a.gain_loss || 0;
          bValue = b.gain_loss || 0;
          break;
        case 'allocation':
          aValue = a.allocation_percentage;
          bValue = b.allocation_percentage;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        default:
          aValue = a.market_value;
          bValue = b.market_value;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [holdings, searchTerm, sortField, sortDirection, filterType]);

  // Get unique security types for filter
  const securityTypes = useMemo(() => {
    const types = new Set(holdings.map(h => h.security.type));
    return Array.from(types);
  }, [holdings]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <SortAsc className="h-4 w-4" />
    ) : (
      <SortDesc className="h-4 w-4" />
    );
  };

  const getGainLossIcon = (value: number | null) => {
    if (!value) return <Minus className="h-4 w-4" />;
    return value > 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Holdings Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your portfolio holdings will appear here once your accounts are connected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {hideValues ? '••••••' : formatCurrency(summary.total_value)}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${getGainLossColor(summary.total_gain_loss)}`}>
                {hideValues ? '••••••' : formatCurrency(summary.total_gain_loss)}
              </p>
            </div>
            {getGainLossIcon(summary.total_gain_loss)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Return %</p>
              <p className={`text-2xl font-bold ${getGainLossColor(summary.total_gain_loss_percentage)}`}>
                {hideValues ? '••••••' : formatPercentage(summary.total_gain_loss_percentage)}
              </p>
            </div>
            {getGainLossIcon(summary.total_gain_loss_percentage)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Holdings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.holdings_count}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search holdings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              {securityTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={() => setHideValues(!hideValues)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={hideValues ? 'Show values' : 'Hide values'}
            >
              {hideValues ? (
                <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 ${viewMode === 'cards' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <PieChart className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedHoldings.map((holding) => (
            <div
              key={holding.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {holding.security.ticker_symbol || holding.security.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {holding.security.name}
                  </p>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                  {holding.security.type}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Market Value</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {hideValues ? '••••••' : formatCurrency(holding.market_value)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quantity</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {holding.quantity.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Gain/Loss</span>
                  <div className="flex items-center space-x-1">
                    {getGainLossIcon(holding.gain_loss)}
                    <span className={`font-semibold ${getGainLossColor(holding.gain_loss || 0)}`}>
                      {hideValues ? '••••••' : formatCurrency(holding.gain_loss || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Allocation</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPercentage(holding.allocation_percentage / 100)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Security</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Quantity</span>
                      {getSortIcon('quantity')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Market Value</span>
                      {getSortIcon('value')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('gain_loss')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Gain/Loss</span>
                      {getSortIcon('gain_loss')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('allocation')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Allocation</span>
                      {getSortIcon('allocation')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredAndSortedHoldings.map((holding) => (
                  <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {holding.security.ticker_symbol || holding.security.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                          {holding.security.name}
                        </div>
                        <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded mt-1">
                          {holding.security.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      {holding.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {hideValues ? '••••••' : formatCurrency(holding.market_value)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {getGainLossIcon(holding.gain_loss)}
                        <span className={`font-semibold ${getGainLossColor(holding.gain_loss || 0)}`}>
                          {hideValues ? '••••••' : formatCurrency(holding.gain_loss || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {formatPercentage(holding.allocation_percentage / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredAndSortedHoldings.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No holdings match your search criteria.
        </div>
      )}
    </div>
  );
}