# Deployment Guide: Heroku Backend + Vercel Frontend

## Architecture Overview

- **Backend**: Heroku (Python FastAPI + Java Spring Boot)
- **Frontend**: Vercel (React SPA)
- **Database**: Supabase (PostgreSQL)

## Heroku Backend Setup

### Environment Variables
Set these in Heroku dashboard or using Heroku CLI:

```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Python ML Service
ML_SERVICE_URL=http://localhost:8001

# Java Spring Boot (if using dual setup)
SPRING_PROFILES_ACTIVE=production
```

### Deployment Commands
```bash
# Deploy to Heroku
git push heroku main

# Set environment variables
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_ANON_KEY=your-anon-key
```

### Backend URL Structure
- Main API: `https://your-app.herokuapp.com/`
- Health check: `https://your-app.herokuapp.com/`
- Portfolio analysis: `https://your-app.herokuapp.com/analyze`

## Vercel Frontend Setup

### Environment Variables
Set these in Vercel dashboard:

```bash
# Required
REACT_APP_API_URL=https://your-heroku-app.herokuapp.com

# Optional (if used in frontend)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Deployment Commands
```bash
# Deploy to Vercel (from frontend directory)
cd frontend
vercel --prod

# Or connect GitHub repo for automatic deployments
```

### Custom Domain Setup
1. Add custom domain in Vercel dashboard
2. Update CORS settings in backend to include your domain
3. Update DNS records to point to Vercel

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (local development)
- `https://myportfoliotracker.xyz` (custom domain)
- `https://*.myportfoliotracker.xyz` (subdomains)
- `https://*.vercel.app` (Vercel domains)

## Testing the Setup

1. **Backend Health Check**:
   ```bash
   curl https://your-heroku-app.herokuapp.com/
   ```

2. **Frontend to Backend Connection**:
   - Open your Vercel frontend
   - Check browser console for API calls
   - Verify no CORS errors

3. **API Endpoint Test**:
   ```bash
   curl -X POST https://your-heroku-app.herokuapp.com/analyze \
     -H "Content-Type: application/json" \
     -d '{"allocation":{"stocks":0.6,"bonds":0.3,"alternatives":0.1,"cash":0},"risk_tolerance":"medium"}'
   ```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Verify your frontend domain is in the CORS allowed origins
   - Check that credentials are properly configured

2. **Environment Variables**:
   - Ensure `REACT_APP_API_URL` points to your Heroku backend
   - Verify all required environment variables are set

3. **Build Failures**:
   - Frontend: Check that `vercel.json` is properly configured
   - Backend: Ensure Python dependencies are in `requirements.txt`

4. **API Connection Issues**:
   - Verify backend is running: `heroku logs --tail`
   - Check network tab in browser dev tools
   - Ensure API endpoints are correctly formatted

## File Structure After Setup

```
portfolio_risk_analyzer/
├── backend/                 # Deployed to Heroku
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── src/                # Java Spring Boot (if using)
├── frontend/               # Deployed to Vercel
│   ├── src/
│   ├── vercel.json        # Vercel configuration
│   └── .env.example       # Environment variables template
├── package.json           # Backend-only scripts
├── Procfile              # Heroku process configuration
└── DEPLOYMENT.md         # This file
```

## Production Checklist

- [ ] Backend deployed to Heroku successfully
- [ ] Frontend deployed to Vercel successfully
- [ ] Environment variables configured on both platforms
- [ ] CORS configured for your domains
- [ ] API endpoints accessible from frontend
- [ ] Database connections working
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates active
- [ ] Monitoring and logging configured