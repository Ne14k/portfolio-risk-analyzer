import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Brain, Save, Lock, ChevronRight } from 'lucide-react';

interface NavigationSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  {
    id: 'analyze-risk',
    label: 'Analyze Risk',
    icon: BarChart3,
    available: true,
    description: 'Analyze your portfolio risk and get optimization recommendations'
  },
  {
    id: 'forecast-return',
    label: 'Forecast Return',
    icon: TrendingUp,
    available: false,
    description: 'Predict future portfolio returns based on market conditions'
  },
  {
    id: 'stress-test',
    label: 'Stress Test',
    icon: AlertTriangle,
    available: false,
    description: 'Test portfolio performance under various market scenarios'
  },
  {
    id: 'ai-suggestions',
    label: 'AI Suggestions',
    icon: Brain,
    available: false,
    description: 'Get AI-powered investment recommendations'
  },
  {
    id: 'save-export',
    label: 'Save or Export',
    icon: Save,
    available: false,
    requiresLogin: true,
    description: 'Save your portfolio analysis or export reports'
  }
];

export function NavigationSidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse }: NavigationSidebarProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex-shrink-0`}>
      <div className="p-4">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
        >
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Portfolio Tools
            </h2>
          )}
          <ChevronRight className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${
            isCollapsed ? 'rotate-0' : 'rotate-90'
          }`} />
        </button>
      </div>

      <nav className="px-2 pb-4">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;
            const isDisabled = !item.available;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => item.available && onViewChange(item.id)}
                  disabled={isDisabled}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-800/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                      : isDisabled
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  } ${!isCollapsed ? 'justify-start' : 'justify-center'}`}
                  title={isCollapsed ? item.label : item.description}
                >
                  <div className="flex items-center">
                    <IconComponent className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && (
                      <span className="flex-1">{item.label}</span>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex items-center ml-2">
                      {item.requiresLogin && (
                        <Lock className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1" />
                      )}
                      {!item.available && !item.requiresLogin && (
                        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-xs"></div>
                        </div>
                      )}
                      {index === 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm flex items-center justify-center mr-2">
                <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-xs"></div>
              </div>
              <span>Coming Soon</span>
            </div>
            <div className="flex items-center">
              <Lock className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-2" />
              <span>Requires Login</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}