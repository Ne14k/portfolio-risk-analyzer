import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="group relative p-3 rounded-2xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-300/50 dark:border-gray-600/50"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun 
          className={`absolute inset-0 h-6 w-6 text-amber-500 transition-all duration-300 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
        <Moon 
          className={`absolute inset-0 h-6 w-6 text-green-400 transition-all duration-300 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
    </button>
  );
};