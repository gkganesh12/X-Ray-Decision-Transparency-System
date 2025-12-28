# X-Ray System - Vercel Deployment Guide

## 🚀 Why Vercel?

Vercel is the **best choice** for deploying the X-Ray Dashboard because:
- ✅ **Optimized for React/Vite**: Zero-config deployment for Vite apps
- ✅ **Automatic Deployments**: Deploy on every push to main branch
- ✅ **Edge Network**: Global CDN for fast loading
- ✅ **Free Tier**: Generous free tier for personal projects
- ✅ **Monorepo Support**: Native support for monorepos
- ✅ **Preview Deployments**: Automatic preview URLs for PRs
- ✅ **Environment Variables**: Easy configuration management

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Your code pushed to GitHub

## 🎯 Deployment Strategy

For the X-Ray system, we recommend a **hybrid deployment**:

1. **Dashboard (Frontend)**: Deploy to **Vercel** ✅
2. **API Server**: Deploy to **Railway** or **Render** (better for Express + SQLite)

**Why?** SQLite requires persistent file storage, which doesn't work well with Vercel's serverless functions. However, we'll show you both options:

- **Option A**: Dashboard on Vercel + API on Railway/Render (Recommended)
- **Option B**: Full-stack on Vercel with serverless functions (Alternative)

---

## 🎨 Option A: Dashboard on Vercel (Recommended)

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy Dashboard to Vercel

#### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to [Vercel](https://vercel.com)** and sign in with GitHub
2. **Click "Add New Project"**
3. **Import your repository**: `gkganesh12/X-Ray-Decision-Transparency-System`
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `packages/dashboard`
   - **Build Command**: `cd ../.. && npm install && npm run build --workspace=packages/dashboard`
   - **Output Directory**: `packages/dashboard/dist`
   - **Install Command**: `npm install`

5. **Environment Variables**:
   ```
   VITE_API_URL=https://your-api-url.railway.app
   ```
   (Replace with your API server URL)

6. **Click "Deploy"**

#### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to dashboard directory
cd packages/dashboard

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? xray-dashboard
# - Directory? ./
# - Override settings? No
```

### Step 3: Configure Environment Variables

After deployment, add environment variables:

1. Go to your project on Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   ```
   VITE_API_URL=https://your-api-server-url.com
   ```
4. **Redeploy** to apply changes

### Step 4: Deploy API Server (Railway - Recommended)

Since SQLite needs persistent storage, deploy the API server separately:

#### Railway Deployment

1. **Go to [Railway](https://railway.app)** and sign in with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. **Select your repository**
4. **Configure Service**:
   - **Root Directory**: `packages/server`
   - **Build Command**: `cd ../.. && npm install && npm run build`
   - **Start Command**: `cd packages/server && node dist/index.js`
   - **Port**: `3001`

5. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-change-this
   DB_PATH=/app/data/xray.db
   ```

6. **Get the Railway URL** (e.g., `https://xray-api.railway.app`)

7. **Update Vercel Environment Variable**:
   - Go back to Vercel Dashboard
   - Update `VITE_API_URL` to your Railway URL
   - Redeploy

### Step 5: Update CORS in API Server

Update your API server to allow requests from Vercel domain:

```typescript
// packages/server/src/middleware/cors.ts
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-vercel-app.vercel.app',
  'https://your-custom-domain.com',
];
```

---

## 🔧 Option B: Full-Stack on Vercel (Alternative)

If you want to deploy everything on Vercel, you'll need to:

1. **Convert API to Serverless Functions**
2. **Use External Database** (Vercel Postgres, Supabase, etc.)

### Convert Express API to Vercel Serverless Functions

Create `api/index.ts` in your server package:

```typescript
// packages/server/api/index.ts
import express from 'express';
import { createServer } from '../src/index';

const app = createServer();

export default app;
```

Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/dashboard/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "packages/server/api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "packages/server/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "packages/dashboard/dist/$1"
    }
  ]
}
```

**Note**: This approach requires significant refactoring and doesn't work well with SQLite. **Option A is recommended.**

---

## 📝 Vercel Configuration File

Create `vercel.json` in the root directory:

```json
{
  "version": 2,
  "buildCommand": "cd ../.. && npm install && npm run build --workspace=packages/dashboard",
  "outputDirectory": "packages/dashboard/dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🔐 Environment Variables

### Dashboard (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API server URL | `https://xray-api.railway.app` |

### API Server (Railway/Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `DB_PATH` | Database path | `/app/data/xray.db` |
| `CORS_ORIGIN` | Allowed origins | `https://your-app.vercel.app` |

---

## 🚀 Deployment Steps Summary

### Quick Deploy (Dashboard to Vercel)

1. ✅ Push code to GitHub
2. ✅ Go to [vercel.com](https://vercel.com)
3. ✅ Import repository
4. ✅ Configure:
   - Root: `packages/dashboard`
   - Framework: Vite
   - Build: `cd ../.. && npm install && npm run build --workspace=packages/dashboard`
   - Output: `packages/dashboard/dist`
5. ✅ Add environment variable: `VITE_API_URL`
6. ✅ Deploy!

### API Server (Railway)

1. ✅ Go to [railway.app](https://railway.app)
2. ✅ New Project → GitHub repo
3. ✅ Configure:
   - Root: `packages/server`
   - Build: `cd ../.. && npm install && npm run build`
   - Start: `cd packages/server && node dist/index.js`
4. ✅ Add environment variables
5. ✅ Get Railway URL
6. ✅ Update Vercel `VITE_API_URL`

---

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- ✅ Push to `main` branch → Production deployment
- ✅ Pull requests → Preview deployment
- ✅ Manual deployment from dashboard

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL

---

## 📊 Monitoring & Analytics

Vercel provides:
- **Deployment Logs**: View build and deployment logs
- **Analytics**: Performance metrics (requires upgrade)
- **Speed Insights**: Core Web Vitals (requires upgrade)
- **Error Tracking**: Function logs and errors

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: Build command fails
**Solution**: 
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify build command works locally

### API Connection Errors

**Issue**: Dashboard can't connect to API
**Solution**:
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration in API server
- Ensure API server is running and accessible

### Environment Variables Not Working

**Issue**: Variables not available at runtime
**Solution**:
- Variables must start with `VITE_` for Vite apps
- Redeploy after adding variables
- Check variable names match exactly

### Routing Issues (404 on refresh)

**Issue**: Direct URL access returns 404
**Solution**: 
- Add `rewrites` to `vercel.json` (already included above)
- Ensure SPA routing is configured

---

## 🎯 Production Checklist

Before going live:

- [ ] API server deployed and accessible
- [ ] Environment variables configured
- [ ] CORS configured for production domain
- [ ] JWT_SECRET changed from default
- [ ] Database backups configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Error monitoring set up
- [ ] Performance tested

---

## 📈 Performance Optimization

### Vercel Optimizations

Vercel automatically:
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Image optimization (with upgrade)
- ✅ Edge caching
- ✅ CDN distribution

### Manual Optimizations

1. **Enable Compression**: Already handled by Vite
2. **Optimize Images**: Use WebP format
3. **Lazy Loading**: Already implemented in React
4. **Bundle Analysis**: Use `npm run build -- --analyze`

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Railway Documentation](https://docs.railway.app)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 💡 Tips

1. **Use Preview Deployments**: Test changes in PRs before merging
2. **Monitor Build Times**: Keep builds under 5 minutes
3. **Optimize Dependencies**: Remove unused packages
4. **Use Edge Functions**: For better performance (requires upgrade)
5. **Set Up Alerts**: Get notified of deployment failures

---

## 🎉 Success!

Once deployed, your X-Ray Dashboard will be available at:
- **Production**: `https://your-app.vercel.app`
- **Preview**: `https://your-app-git-branch.vercel.app`

Your API server will be at:
- **Railway**: `https://your-api.railway.app`

Happy deploying! 🚀

