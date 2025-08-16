# LeadGenie Backend Deployment to Render

This guide will help you deploy the LeadGenie backend to Render with PostgreSQL and Redis.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code must be in a GitHub repository
3. **Groq API Key**: Get from [console.groq.com](https://console.groq.com)

## Deployment Steps

### 1. Push Your Code to GitHub

Ensure all files are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Deploy via Blueprint (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"** to deploy all services

### 3. Manual Environment Variables Setup

If using manual deployment, set these environment variables in Render:

#### Required Variables
```bash
# Security
SECRET_KEY=<generate-a-strong-32-character-secret>
FIRST_SUPERUSER=admin@leadgenie.com
FIRST_SUPERUSER_PASSWORD=<generate-strong-password>

# AI Service
GROQ_API_KEY=<your-groq-api-key>

# Optional: OpenAI (if using as fallback)
OPENAI_API_KEY=<your-openai-api-key>

# Production Settings
SECURE_COOKIES=true
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (update with your frontend domain)
BACKEND_CORS_ORIGINS=https://leadgenie-frontend.onrender.com,http://localhost:3000
```

#### Auto-Generated Variables (by Render)
These are automatically set when using the blueprint:
- `POSTGRES_SERVER`
- `POSTGRES_USER` 
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_URL` (Redis connection string)

### 4. Services Created

The deployment will create:

1. **Web Service** (`leadgenie-api`)
   - FastAPI application
   - Auto-scaling on Starter plan
   - Health check at `/health`

2. **PostgreSQL Database** (`leadgenie-db`)
   - Managed PostgreSQL instance
   - Automatic backups
   - Connection pooling

3. **Redis Instance** (`leadgenie-redis`)
   - For caching and background tasks
   - Managed Redis with persistence

### 5. Post-Deployment Verification

Once deployed, verify your API is working:

```bash
# Replace with your actual Render URL
curl https://leadgenie-api.onrender.com/health

# Expected response:
{"status":"healthy"}
```

Test the API documentation:
```
https://leadgenie-api.onrender.com/api/v1/docs
```

### 6. Database Migrations

Migrations run automatically during deployment via the `scripts/deploy.py` script. If you need to run them manually:

```bash
# In the Render shell
python scripts/deploy.py
```

### 7. Superuser Creation

A superuser is automatically created with:
- Email: Value from `FIRST_SUPERUSER`
- Password: Value from `FIRST_SUPERUSER_PASSWORD`
- Role: Admin

## Manual Deployment Alternative

If you prefer manual setup:

1. Create PostgreSQL database
2. Create Redis instance  
3. Create Web Service with:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Environment Configurations

### Development
- Uses local PostgreSQL/Redis
- Debug logging enabled
- CORS allows localhost origins

### Production (Render)
- Managed PostgreSQL/Redis
- Structured logging
- HTTPS-only cookies
- Production CORS settings

## Monitoring & Logs

- **Application Logs**: Available in Render dashboard
- **Performance**: Built-in Render metrics
- **Health Checks**: `/health` endpoint
- **API Docs**: `/api/v1/docs` endpoint

## Security Features

✅ **HTTPS Enforced**: All communication encrypted  
✅ **Secure Cookies**: HttpOnly, Secure, SameSite  
✅ **JWT Tokens**: HS256 with 15-minute expiry  
✅ **Password Hashing**: bcrypt with salt  
✅ **CORS Protection**: Configured origins only  
✅ **Environment Secrets**: No hardcoded credentials  

## Scaling

- **Starter Plan**: Good for development/testing
- **Standard Plan**: Production workloads
- **Auto-scaling**: Based on CPU/memory usage

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Python version (should be 3.11+)
   - Verify all dependencies in requirements.txt

2. **Database Connection**
   - Ensure database environment variables are set
   - Check database service is running

3. **CORS Errors**
   - Update `BACKEND_CORS_ORIGINS` with frontend URL
   - Ensure protocol matches (http/https)

### Getting Help

- Check Render logs in dashboard
- Use `/health` endpoint to verify service status
- Review environment variables configuration

## Cost Estimation

**Starter Plan (Development)**:
- Web Service: $7/month
- PostgreSQL: $7/month  
- Redis: $7/month
- **Total**: ~$21/month

**Standard Plan (Production)**:
- Scales based on usage
- Additional features like auto-scaling
- Higher resource limits

## Next Steps

1. **Deploy Frontend**: Follow frontend deployment guide
2. **Custom Domain**: Configure custom domain in Render
3. **Monitoring**: Set up error tracking (Sentry, etc.)
4. **CI/CD**: Configure automatic deployments on git push
5. **Backup Strategy**: Configure additional backup retention

---

Your LeadGenie backend is now ready for production use on Render! 🚀