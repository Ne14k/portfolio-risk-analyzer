// Quick test function to verify Finnhub API
export const testFinnhubAPI = async () => {
  const apiKey = 'd1jtm7hr01ql1h39d8h0d1jtm7hr01ql1h39d8hg';
  const testUrl = `https://finnhub.io/api/v1/search?q=AAPL&token=${apiKey}`;
  
  console.log('Testing Finnhub API with URL:', testUrl);
  
  try {
    const response = await fetch(testUrl);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Test failed:', error);
    return null;
  }
};

// You can call this in the browser console: testFinnhubAPI()