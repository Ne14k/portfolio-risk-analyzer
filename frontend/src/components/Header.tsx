import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Menu, X, FileBarChart, TrendingUp as TrendingUpIcon, Brain, Target, AlertTriangle, DollarSign, User, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function Header({ isDark, onThemeToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Import Portfolio",
      description: "Connect your brokerage accounts with Plaid",
      icon: FileBarChart,
      path: "/import-portfolio"
    },
    {
      title: "Forecast My Portfolio", 
      description: "Runs Monte Carlo simulations",
      icon: TrendingUpIcon,
      path: "/forecast"
    },
    {
      title: "Understand My Risk",
      description: "LLM explains Sharpe ratio, volatility, etc.",
      icon: Brain,
      path: "/understand-risk"
    },
    {
      title: "Optimize My Strategy",
      description: "AI reallocates portfolio based on risk/return goals",
      icon: Target,
      path: "/optimize"
    },
    {
      title: "Test Market Crashes",
      description: "Simulates 2008/Fed hike scenarios", 
      icon: AlertTriangle,
      path: "/test-crashes"
    },
    {
      title: "What If I Invested In…",
      description: "Scenario builder w/ backtest logic",
      icon: DollarSign,
      path: "/what-if"
    }
  ];

  const closeMenu = () => setIsMenuOpen(false);

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      closeMenu();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm relative z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Hamburger Menu + Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
                <div className="p-2 bg-green-600 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  MyPortfolioTracker
                </h1>
              </Link>
            </div>
            
            {/* Right side - Auth Buttons + Theme Toggle */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3">
                {user ? (
                  // Authenticated user menu
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {user.full_name || user.email}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      disabled={loading}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  // Unauthenticated user buttons
                  <>
                    <button
                      onClick={handleLoginClick}
                      className="px-4 py-2 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={handleSignupClick}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
              
              <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={closeMenu}
            />
            
            {/* Menu Content */}
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 ml-4">
              <div className="p-4">
                <div className="space-y-2">
                  {menuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={index}
                        to={item.path}
                        onClick={closeMenu}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-800/30 transition-colors">
                          <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <Link
                    to="/demo"
                    onClick={closeMenu}
                    className="flex items-center justify-center w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Try Demo
                  </Link>
                  
                  {/* Mobile Auth Buttons */}
                  <div className="md:hidden">
                    {user ? (
                      // Authenticated user mobile menu
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {user.full_name || user.email}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            handleSignOut();
                            closeMenu();
                          }}
                          disabled={loading}
                          className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      // Unauthenticated user mobile buttons
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            handleLoginClick();
                            closeMenu();
                          }}
                          className="flex-1 px-4 py-2 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 font-medium"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            handleSignupClick();
                            closeMenu();
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-medium"
                        >
                          Sign Up
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}