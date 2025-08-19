// Example searches to demonstrate the Finnhub API capabilities

export const SEARCH_EXAMPLES = {
  stocks: [
    { query: 'AAPL', description: 'Apple Inc.' },
    { query: 'TSLA', description: 'Tesla Inc.' },
    { query: 'GOOGL', description: 'Alphabet Inc.' },
    { query: 'MSFT', description: 'Microsoft Corp.' }
  ],
  etfs: [
    { query: 'SPY', description: 'SPDR S&P 500 ETF' },
    { query: 'VTI', description: 'Vanguard Total Stock Market ETF' },
    { query: 'QQQ', description: 'Invesco QQQ ETF' },
    { query: 'BND', description: 'Vanguard Total Bond Market ETF' }
  ],
  crypto: [
    { query: 'BTC', description: 'Bitcoin' },
    { query: 'ETH', description: 'Ethereum' },
    { query: 'ADA', description: 'Cardano' },
    { query: 'SOL', description: 'Solana' }
  ]
};

export const getRandomExample = () => {
  const categories = Object.values(SEARCH_EXAMPLES);
  const allExamples = categories.flat();
  return allExamples[Math.floor(Math.random() * allExamples.length)];
};