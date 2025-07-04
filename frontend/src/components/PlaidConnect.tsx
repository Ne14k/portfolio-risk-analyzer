import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Link as LinkIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createLinkToken, exchangePublicToken } from '../services/plaid';

interface PlaidConnectProps {
  onSuccess: (institutionName: string) => void;
  onError?: (error: string) => void;
}

export function PlaidConnect({ onSuccess, onError }: PlaidConnectProps) {
  const { user } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Initialize link token when component mounts
  useEffect(() => {
    const initializeLinkToken = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await createLinkToken(user.id);
        setLinkToken(response.link_token);
      } catch (err) {
        const errorMessage = 'Failed to initialize Plaid connection. Please try again.';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeLinkToken();
  }, [user?.id, onError]);

  // Handle successful connection
  const handleOnSuccess = useCallback(async (public_token: string, metadata: any) => {
    if (!user?.id) return;
    
    setConnecting(true);
    setError(null);
    
    try {
      await exchangePublicToken(public_token, user.id);
      const institutionName = metadata.institution?.name || 'Unknown Institution';
      onSuccess(institutionName);
    } catch (err) {
      const errorMessage = 'Failed to complete account connection. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setConnecting(false);
    }
  }, [user?.id, onSuccess, onError]);

  // Handle connection exit
  const handleOnExit = useCallback((err: any, metadata: any) => {
    if (err) {
      const errorMessage = err.error_message || 'Connection was cancelled or failed.';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  // Handle Plaid events for analytics
  const handleOnEvent = useCallback((eventName: string, metadata: any) => {
    console.log('Plaid event:', eventName, metadata);
  }, []);

  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
    onEvent: handleOnEvent,
  };

  const { open, ready } = usePlaidLink(config);

  // Handle connect button click
  const handleConnect = () => {
    if (ready && !connecting) {
      setError(null);
      open();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 mx-auto mb-4 text-green-600 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Initializing secure connection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
          <LinkIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Connect Your Brokerage
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          Securely connect your investment accounts to automatically import your portfolio data.
        </p>

        {/* Security Features */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200">Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200">256-bit encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200">Read-only access</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Your portfolio data is only displayed for analysis - never stored on our servers
              </p>
            </div>
          </div>
        </div>

        {/* Supported Institutions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { name: 'Fidelity', color: 'bg-green-100 text-green-800' },
            { name: 'Schwab', color: 'bg-blue-100 text-blue-800' },
            { name: 'Vanguard', color: 'bg-red-100 text-red-800' },
            { name: 'E*TRADE', color: 'bg-purple-100 text-purple-800' },
            { name: 'TD Ameritrade', color: 'bg-orange-100 text-orange-800' },
            { name: 'Robinhood', color: 'bg-pink-100 text-pink-800' },
            { name: 'Interactive Brokers', color: 'bg-indigo-100 text-indigo-800' },
            { name: '+12,000 more', color: 'bg-gray-100 text-gray-800' },
          ].map((institution, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg text-xs font-medium text-center ${institution.color} dark:bg-opacity-20`}
            >
              {institution.name}
            </div>
          ))}
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={!ready || connecting || loading}
          className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-3"
        >
          {connecting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-5 w-5" />
              <span>Connect Your Account</span>
            </>
          )}
        </button>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 max-w-md mx-auto">
          By connecting your account, you agree to Plaid's Terms of Service and Privacy Policy. 
          Your credentials and portfolio data are never stored on our servers - we only display your data for analysis.
        </p>
      </div>
    </div>
  );
}