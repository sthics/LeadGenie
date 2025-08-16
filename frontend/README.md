# LeadGenie Frontend

React frontend for the AI-powered lead qualification platform. Built with React 18, Vite, Tailwind CSS, and deployed free on Vercel.

## 🚀 Quick Deploy to Vercel (2 minutes)

**[📋 Quick Checklist](./vercel-checklist.md)** | **[📖 Detailed Guide](./VERCEL-DEPLOYMENT.md)**

1. Push code to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Set `VITE_API_URL` environment variable
4. Deploy!

## 🏃‍♂️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## ⚙️ Environment Setup

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

**Required**: Update `VITE_API_URL` with your backend URL:
```bash
# Local development
VITE_API_URL=http://localhost:8000

# Production (after backend deployment)
VITE_API_URL=https://your-backend.railway.app
```

## 📜 Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Tech Stack

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client with interceptors
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── landing/     # Landing page sections
│   │   └── layout/      # Layout components
│   ├── pages/           # Route components
│   ├── services/        # API service layer
│   ├── stores/          # Zustand state stores
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── vercel.json          # Vercel deployment config
└── vite.config.js       # Vite configuration
```

## 🔗 Integration

### Backend Connection
The frontend connects to the FastAPI backend via REST APIs:
- Authentication (login, register, refresh tokens)
- Lead management (CRUD operations)
- AI qualification (lead scoring)

### State Management
- **Auth Store**: User authentication state
- **Leads Store**: Lead data and operations
- **Theme**: Dark/light mode toggle

### Routing
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard (protected)
- `/dashboard/submit` - Lead form (protected)

## 🎨 Styling

### Tailwind CSS
Uses utility-first approach with:
- Responsive design (`sm:`, `md:`, `lg:`)
- Dark mode support (`dark:`)
- Custom color palette
- Animation utilities

### Theme System
- Light/dark mode toggle
- Persistent theme storage
- System preference detection
- Smooth transitions

## 🔧 Development

### Local Development
```bash
# Start both frontend and backend
npm run dev              # Frontend (port 5173)
cd ../backend && uvicorn app.main:app --reload  # Backend (port 8000)
```

### Testing API Integration
```bash
# Test backend connection
curl http://localhost:8000/health

# Test with frontend
# Browser console: fetch('http://localhost:8000/health')
```

## 🚀 Deployment Options

### 1. Vercel (Recommended - FREE)
- ✅ Unlimited static sites
- ✅ Automatic deployments from Git
- ✅ Global CDN
- ✅ Custom domains

### 2. Netlify (Alternative - FREE)
- ✅ 100GB bandwidth/month
- ✅ Form handling
- ✅ Serverless functions

### 3. GitHub Pages (Basic - FREE)
- ✅ Static hosting
- ⚠️ Public repos only

## 📊 Performance

### Optimization Features
- Code splitting with React.lazy()
- Bundle optimization with Vite
- Image optimization
- CSS purging
- Tree shaking

### Metrics
- First Contentful Paint: <1.8s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Bundle size: <200KB gzipped

## 🆓 Free Hosting

**Total Cost: $0.00/month**
- Vercel: Unlimited sites
- Custom domain: Free with Vercel
- SSL certificate: Automatic
- Global CDN: Included

Perfect for personal projects, portfolios, and small business applications!

## 🔧 Troubleshooting

### Common Issues
1. **Build fails**: Check `npm run build` locally
2. **API not working**: Verify `VITE_API_URL` environment variable
3. **CORS errors**: Update backend CORS settings with frontend URL
4. **404 on refresh**: Ensure SPA routing is configured

### Need Help?
- 📖 [Detailed Deployment Guide](./VERCEL-DEPLOYMENT.md)
- 📋 [Quick Checklist](./vercel-checklist.md)
- 🔗 [Vercel Documentation](https://vercel.com/docs)

---

**Ready to deploy?** Follow the [2-minute checklist](./vercel-checklist.md)! 🚀 