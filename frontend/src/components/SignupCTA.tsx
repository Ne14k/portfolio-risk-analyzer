import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface SignupCTAProps {
  featureName: string;
  description: string;
}

export function SignupCTA({ featureName, description }: SignupCTAProps) {
  const handleSignupClick = () => {
    // Placeholder for signup functionality
    alert(`Sign up to access ${featureName} and all portfolio analysis tools.`);
  };

  return (
    <section className="py-20 bg-green-50 dark:bg-green-900/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 lg:p-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Want to try {featureName}?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {description} Sign up to access this powerful feature and all our other portfolio analysis tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleSignupClick}
              className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Sign Up
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}