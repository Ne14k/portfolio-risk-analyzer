import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load components for code splitting
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const DemoPage = lazy(() => import('./components/DemoPage').then(m => ({ default: m.DemoPage })));
const ImportPortfolioPage = lazy(() => import('./components/ImportPortfolioPage').then(m => ({ default: m.ImportPortfolioPage })));
const ForecastPage = lazy(() => import('./components/ForecastPage').then(m => ({ default: m.ForecastPage })));
const UnderstandRiskPage = lazy(() => import('./components/UnderstandRiskPage').then(m => ({ default: m.UnderstandRiskPage })));
const OptimizeStrategyPage = lazy(() => import('./components/OptimizeStrategyPage').then(m => ({ default: m.OptimizeStrategyPage })));
const TestCrashesPage = lazy(() => import('./components/TestCrashesPage').then(m => ({ default: m.TestCrashesPage })));
const WhatIfPage = lazy(() => import('./components/WhatIfPage').then(m => ({ default: m.WhatIfPage })));

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
  

  // Apply theme changes to the document
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

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                isDark={isDark} 
                onThemeToggle={handleThemeToggle} 
              />
            } 
          />
          <Route 
            path="/demo" 
            element={
              <DemoPage 
                isDark={isDark} 
                onThemeToggle={handleThemeToggle} 
              />
            } 
          />
          <Route 
            path="/import-portfolio" 
            element={
              <ImportPortfolioPage 
                isDark={isDark} 
                onThemeToggle={handleThemeToggle} 
              />
            } 
          />
          <Route 
            path="/forecast" 
            element={
              <ForecastPage 
                isDark={isDark} 
                onThemeToggle={handleThemeToggle} 
              />
            } 
          />
          <Route 
            path="/understand-risk" 
            element={
              <UnderstandRiskPage 
                isDark={isDark} 
                onThemeToggle={handleThemeToggle} 
              />
            } 
          />
          <Route 
            path="/optimize" 
            element={
              <OptimizeStrategyPage 
                isDark={isDark} 
                onThemeToggle={handleThemeToggle} 
              />
            } 
          />
          <Route 
            path="/test-crashes" 
            element={
              <TestCrashesPage 
                isDark={isDark} 
                onThemeToggle={handleThemeToggle} 
              />
            } 
          />
          <Route 
            path="/what-if" 
            element={
              <WhatIfPage 
                isDark={isDark} 
                onThemeToggle={handleThemeToggle} 
              />
            } 
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
