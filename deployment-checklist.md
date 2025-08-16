# LeadGenie Render Deployment Checklist

## Pre-Deployment ✅

- [ ] Code committed and pushed to GitHub
- [ ] `render.yaml` configuration file created
- [ ] `requirements.txt` updated for production
- [ ] Environment variables template ready (`.env.production`)
- [ ] Database migration script created (`scripts/deploy.py`)
- [ ] Groq API key obtained

## Render Setup ✅

- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] Blueprint deployment initiated from `render.yaml`

## Environment Variables ✅

### Required (Set in Render Dashboard)
- [ ] `SECRET_KEY` (32+ character string)
- [ ] `FIRST_SUPERUSER` (admin email)
- [ ] `FIRST_SUPERUSER_PASSWORD` (strong password)
- [ ] `GROQ_API_KEY` (your Groq API key)

### Optional
- [ ] `OPENAI_API_KEY` (if using OpenAI as fallback)
- [ ] `BACKEND_CORS_ORIGINS` (update with frontend URL when deployed)

### Auto-Generated (Render handles these)
- [ ] Database connection variables (POSTGRES_*)
- [ ] Redis connection variables (REDIS_*)

## Services Verification ✅

- [ ] **Web Service**: `leadgenie-api` is running
- [ ] **Database**: `leadgenie-db` is active
- [ ] **Redis**: `leadgenie-redis` is connected

## Post-Deployment Testing ✅

- [ ] Health check: `https://your-app.onrender.com/health`
- [ ] API docs: `https://your-app.onrender.com/api/v1/docs`
- [ ] Registration endpoint test
- [ ] Login endpoint test
- [ ] Protected route test (`/api/v1/auth/users/me`)

## Production Readiness ✅

- [ ] HTTPS enforced (automatic on Render)
- [ ] Secure cookies enabled
- [ ] CORS properly configured
- [ ] Database migrations applied
- [ ] Superuser account created
- [ ] Logs are accessible in Render dashboard

## Frontend Integration ✅

- [ ] Frontend `VITE_API_URL` updated to production backend URL
- [ ] CORS origins include frontend domain
- [ ] Authentication flow tested end-to-end

## Security Verification ✅

- [ ] No secrets hardcoded in repository
- [ ] Environment variables properly set
- [ ] Password hashing working (bcrypt)
- [ ] JWT tokens generating correctly
- [ ] Refresh token system functioning

## Monitoring ✅

- [ ] Health endpoint responding
- [ ] Application logs visible
- [ ] Error tracking configured (optional)
- [ ] Performance monitoring active

---

**Your Render URL**: `https://leadgenie-api.onrender.com`

Copy this URL for your frontend environment variables!