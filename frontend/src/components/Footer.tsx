import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Mail } from 'lucide-react';

export function Footer() {

  return (
    <footer className="py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              MyPortfolioTracker
            </span>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Contact
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <a 
                href="mailto:myportfoliotrackapp@gmail.com" 
                className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                myportfoliotrackapp@gmail.com
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              <strong>Important:</strong> This is an educational tool for demonstration purposes. 
              Always consult with qualified financial advisors before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}