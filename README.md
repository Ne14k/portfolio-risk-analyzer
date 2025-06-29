# Portfolio Risk Analyzer

A professional web application for analyzing investment portfolio risk and providing intelligent optimization recommendations using Modern Portfolio Theory.

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
![Portfolio Risk Analyzer Interface](https://via.placeholder.com/800x600/3b82f6/ffffff?text=Portfolio+Risk+Analyzer)

### Mobile View
![Mobile Interface](https://via.placeholder.com/400x600/10b981/ffffff?text=Mobile+View)

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
git clone https://github.com/Ne14k/demonstration_app.git
cd demonstration_app
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

## Project Structure

```
portfolio-risk-analyzer/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript definitions
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # FastAPI Python backend
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Python dependencies
├── package.json            # Root package.json for scripts
└── README.md
```

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

## Development

### Frontend Development
```bash
cd frontend
npm start              # Start development server
npm run build          # Build for production
npm test              # Run tests
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload    # Start with auto-reload
python -m pytest           # Run tests (when added)
```

### Environment Variables
Create a `.env` file in the backend directory for configuration:
```
CORS_ORIGINS=http://localhost:3000
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application is for educational and demonstration purposes only. It should not be used as the sole basis for investment decisions. Always consult with qualified financial advisors before making investment decisions.

## Acknowledgments

- Modern Portfolio Theory concepts from Harry Markowitz
- Risk metrics calculations based on industry standards
- UI/UX inspired by modern fintech applications