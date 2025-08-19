// Performance optimization utilities for Monte Carlo simulations

export class PerformanceOptimizer {
  private static cache = new Map<string, any>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Create cache key for forecast requests
  static createCacheKey(holdings: any[], timeHorizon: string, simulations: number): string {
    const holdingsKey = holdings
      .map(h => `${h.ticker}-${h.quantity}-${h.currentPrice}`)
      .sort()
      .join('|');
    return `forecast-${holdingsKey}-${timeHorizon}-${simulations}`;
  }

  // Check if cached result exists and is still valid
  static getCachedForecast(cacheKey: string): any | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  // Cache forecast result
  static cacheForecast(cacheKey: string, data: any): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    if (this.cache.size > 50) {
      this.cleanupOldEntries();
    }
  }

  // Clean up expired cache entries
  private static cleanupOldEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.CACHE_DURATION) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Validate simulation parameters for optimal performance
  static validateSimulationParams(simulations: number, portfolioSize: number): {
    optimizedSimulations: number;
    warning?: string;
  } {
    let optimizedSimulations = simulations;
    let warning: string | undefined;

    // Adjust simulations based on portfolio complexity
    if (portfolioSize > 20 && simulations > 5000) {
      optimizedSimulations = 5000;
      warning = 'Reduced simulations to 5,000 for large portfolios to maintain performance';
    } else if (portfolioSize > 50 && simulations > 2500) {
      optimizedSimulations = 2500;
      warning = 'Reduced simulations to 2,500 for very large portfolios';
    }

    // Ensure minimum simulations for statistical significance
    if (optimizedSimulations < 1000) {
      optimizedSimulations = 1000;
      warning = 'Increased simulations to 1,000 for statistical significance';
    }

    return { optimizedSimulations, warning };
  }

  // Debounce function for API calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  // Check if browser supports optimal performance features
  static checkBrowserCapabilities(): {
    supportsWebWorkers: boolean;
    supportsWasm: boolean;
    recommendedMaxSimulations: number;
  } {
    const supportsWebWorkers = typeof Worker !== 'undefined';
    const supportsWasm = typeof WebAssembly !== 'undefined';
    
    // Recommend max simulations based on capabilities
    let recommendedMaxSimulations = 5000;
    if (!supportsWebWorkers) {
      recommendedMaxSimulations = 2500;
    }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      recommendedMaxSimulations = Math.min(recommendedMaxSimulations, 3000);
    }

    return {
      supportsWebWorkers,
      supportsWasm,
      recommendedMaxSimulations
    };
  }

  // Memory usage estimation
  static estimateMemoryUsage(simulations: number, portfolioSize: number, timeHorizon: string): {
    estimatedMB: number;
    isHighMemory: boolean;
  } {
    const days = {
      '1_month': 30,
      '3_months': 90,
      '1_year': 365
    }[timeHorizon] || 90;

    // Rough estimation: simulations * portfolio size * days * 8 bytes per number
    const estimatedBytes = simulations * portfolioSize * days * 8;
    const estimatedMB = estimatedBytes / (1024 * 1024);
    
    const isHighMemory = estimatedMB > 100; // Consider > 100MB as high memory

    return { estimatedMB, isHighMemory };
  }
}

// Progress tracking for long-running operations
export class ProgressTracker {
  private listeners: Array<(progress: ProgressUpdate) => void> = [];
  private currentProgress: ProgressUpdate = {
    phase: 'idle',
    progress: 0,
    message: ''
  };

  subscribe(listener: (progress: ProgressUpdate) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  updateProgress(update: Partial<ProgressUpdate>): void {
    this.currentProgress = { ...this.currentProgress, ...update };
    this.listeners.forEach(listener => listener(this.currentProgress));
  }

  reset(): void {
    this.currentProgress = {
      phase: 'idle',
      progress: 0,
      message: ''
    };
    this.listeners.forEach(listener => listener(this.currentProgress));
  }

  getCurrentProgress(): ProgressUpdate {
    return { ...this.currentProgress };
  }
}

export interface ProgressUpdate {
  phase: 'idle' | 'preparing' | 'fetching_data' | 'running_simulation' | 'processing_results' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  details?: string;
}

// Error recovery utilities
export class ErrorRecovery {
  static readonly RETRY_DELAYS = [1000, 2000, 4000]; // Progressive delays

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    shouldRetry: (error: Error) => boolean = () => true
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries || !shouldRetry(lastError)) {
          throw lastError;
        }

        // Wait before retry
        const delay = this.RETRY_DELAYS[Math.min(attempt, this.RETRY_DELAYS.length - 1)];
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static shouldRetryNetworkError(error: Error): boolean {
    const networkErrors = [
      'fetch',
      'network',
      'timeout',
      'connection',
      'ENOTFOUND',
      'ECONNRESET'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return networkErrors.some(keyword => errorMessage.includes(keyword));
  }

  static shouldRetryServerError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    // Retry on 5xx server errors, but not 4xx client errors
    return errorMessage.includes('5') && !errorMessage.includes('4');
  }
}