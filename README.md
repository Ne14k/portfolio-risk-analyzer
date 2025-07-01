# Portfolio Risk Analyzer

A professional AI-powered web application for analyzing investment portfolio risk and providing intelligent optimization recommendations using Modern Portfolio Theory.

## Features

- **Interactive Portfolio Input**: Adjust asset allocations with intuitive sliders
- **Comprehensive Risk Analysis**: Calculate volatility, Sharpe ratio, max drawdown, and diversification scores
- **AI-Powered Optimization**: Generate optimized portfolio allocations based on risk tolerance
- **Educational Insights**: Learn about risk metrics and investment principles
- **Professional Visualizations**: Pie charts, scatter plots, and interactive charts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for optimal viewing

## Screenshots

### Desktop View
- Wait for better version

### Mobile View
- Wait for better version

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **FastAPI** (Python) for high-performance API
- **NumPy** and **SciPy** for financial calculations
- **Pandas** for data manipulation
- **Scikit-learn** for advanced analytics

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ne14k/portfolio-risk-analyzer.git
cd portfolio_risk_analyzer
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Usage

1. **Set Portfolio Allocation**: Use the sliders to adjust your portfolio allocation across stocks, bonds, alternatives, and cash
2. **Choose Risk Tolerance**: Select your risk preference (Conservative, Moderate, or Aggressive)
3. **Set Target Return**: Adjust the target annual return slider
4. **Analyze**: Click "Analyze Portfolio" to get comprehensive risk analysis and optimization recommendations
5. **Review Results**: Examine risk metrics, optimized allocations, and educational insights

## API Documentation

The FastAPI backend provides interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

- `POST /analyze` - Analyze portfolio and get optimization recommendations
- `GET /asset-classes` - Get available asset classes with characteristics

## Risk Metrics Explained

### Volatility
Standard deviation of returns, measuring price fluctuation risk. Lower is generally better for risk-averse investors.

### Sharpe Ratio
Risk-adjusted return measure. Higher is better:
- > 1.0: Good risk-adjusted returns
- > 2.0: Excellent risk-adjusted returns

### Max Drawdown
Largest peak-to-trough decline. Represents worst-case scenario loss from portfolio peak.

### Diversification Score
Measures how well diversified your portfolio is. Higher scores indicate better risk distribution.

## Modern Portfolio Theory

The optimization engine uses Modern Portfolio Theory to:
- Minimize portfolio variance for a given expected return
- Maximize expected return for a given level of risk
- Apply constraints based on risk tolerance preferences

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application is for learning and demonstration purposes only. It should not be used as the sole basis for any investment decisions. Always consult with qualified financial advisors before making any investment decisions.

## Acknowledgments

- Modern Portfolio Theory concepts from Harry Markowitz
- Risk metrics calculations based on industry standards
- UI/UX inspired by modern fintech applications
