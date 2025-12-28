# Render Deployment Guide

Complete guide for deploying the X-Ray Decision Transparency System on Render.

---

## 🎨 Why Render?

Render is an excellent choice for deploying the full X-Ray system because:

- ✅ **Full-Stack Support**: Deploy both API server and dashboard as separate services
- ✅ **Persistent Disk**: Built-in persistent disk storage for SQLite database
- ✅ **Automatic Deployments**: Deploy on every push to main branch
- ✅ **Free Tier**: Generous free tier with persistent storage
- ✅ **WebSocket Support**: Native support for WebSocket connections
- ✅ **Custom Domains**: Free SSL certificates for custom domains
- ✅ **Environment Variables**: Easy management of secrets and configuration
- ✅ **Background Jobs**: Support for background workers (future expansion)
- ✅ **Static Sites**: Optimized static site hosting for dashboard

---

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Node.js 18+**: Render will use the version specified in `package.json`

---

## 🏗️ Architecture Overview

For Render, we'll deploy two services:

1. **API Service** (Web Service): Backend API server
2. **Dashboard Service** (Static Site): Frontend React dashboard

This separation provides:

- Independent scaling
- Better performance (CDN for static assets)
- Easier maintenance
- Cost optimization

---

## 🚀 Step 1: Prepare Your Repository

### 1.1 Quick Start with render.yaml (Recommended)

The repository includes a `render.yaml` file for Infrastructure as Code deployment. This allows you to deploy both services with a single configuration file.

**Option A: Use render.yaml (Easier)**

1. Push `render.yaml` to your repository
2. In Render dashboard, click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create both services
5. Set environment variables in the Render dashboard
6. Deploy!

**Option B: Manual Setup (More Control)**
Follow the step-by-step guide below for manual service creation.

### 1.2 Verify Build Scripts

Ensure your `package.json` has the correct build scripts:

**Root `package.json`**:

```json
{
  "scripts": {
    "build": "npm run build --workspace=packages/sdk && npm run build --workspace=packages/server && npm run build --workspace=packages/dashboard"
  }
}
```

**`packages/server/package.json`**:

```json
{
  "scripts": {
    "build": "tsc && cp src/store/schema.sql dist/store/schema.sql",
    "start": "node dist/index.js"
  }
}
```

**`packages/dashboard/package.json`**:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 1.2 Create Render Configuration (Optional)

Create a `render.yaml` file in the root for Infrastructure as Code:

```yaml
services:
  # API Service
  - type: web
    name: xray-api
    env: node
    plan: free
    rootDir: .
    buildCommand: npm install --include=dev && cd packages/server && npm run build
    startCommand: cd packages/server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DB_PATH
        value: /opt/render/project/src/packages/server/data/xray.db
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 24h
    disk:
      name: xray-db
      mountPath: /opt/render/project/src/packages/server/data
      sizeGB: 1

  # Dashboard Service
  - type: web
    name: xray-dashboard
    env: static
    buildCommand: cd packages/dashboard && npm install && npm run build
    staticPublishPath: packages/dashboard/dist
    envVars:
      - key: VITE_API_URL
        sync: false
```

---

## 🎯 Step 2: Deploy API Service

### 2.1 Create New Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `X-Ray-Decision-Transparency-System`

### 2.2 Configure API Service

**Basic Settings**:

- **Name**: `xray-api` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `.` (root of repository)
- **Runtime**: `Node`
- **Build Command**: `npm install --include=dev && cd packages/server && npm run build`
- **Start Command**: `cd packages/server && npm start`

**Advanced Settings**:

- **Instance Type**: `Free` (or upgrade for production)
- **Auto-Deploy**: `Yes` (deploy on every push)

### 2.3 Add Persistent Disk

1. Scroll to **"Disk"** section
2. Click **"Add Disk"**
3. **Name**: `xray-db`
4. **Mount Path**: `/opt/render/project/src/packages/server/data`
5. **Size**: `1 GB` (free tier) or larger for production
6. This ensures your SQLite database persists across deployments

### 2.4 Configure Environment Variables

Go to **"Environment"** tab and add:

| Variable         | Description          | Example Value                                          |
| ---------------- | -------------------- | ------------------------------------------------------ |
| `NODE_ENV`       | Environment          | `production`                                           |
| `PORT`           | Server port          | `10000` (Render sets this)                             |
| `JWT_SECRET`     | JWT secret key       | `your-super-secret-key-change-me`                      |
| `JWT_EXPIRES_IN` | Token expiration     | `24h`                                                  |
| `DB_PATH`        | Database file path   | `/opt/render/project/src/packages/server/data/xray.db` |
| `CORS_ORIGIN`    | Allowed CORS origins | `https://xray-dashboard.onrender.com`                  |

**Important Notes**:

- `PORT` is automatically set by Render (usually `10000`), but you can override it
- `DB_PATH` must point to the mounted disk path
- `CORS_ORIGIN` will be updated after dashboard deployment

### 2.5 Generate Secure JWT Secret

Generate a secure JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

Add this to `JWT_SECRET` in Render.

### 2.6 Deploy API Service

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Monitor the build logs
4. Once deployed, note the service URL: `https://xray-api.onrender.com`

---

## 🎨 Step 3: Deploy Dashboard Service

### 3.1 Create New Static Site

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository (same repo)
3. Select your repository

### 3.2 Configure Dashboard Service

**Basic Settings**:

- **Name**: `xray-dashboard`
- **Branch**: `main`
- **Root Directory**: `packages/dashboard`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Advanced Settings**:

- **Auto-Deploy**: `Yes`

### 3.3 Configure Environment Variables

Add environment variable for API URL:

| Variable       | Description    | Example Value                   |
| -------------- | -------------- | ------------------------------- |
| `VITE_API_URL` | API server URL | `https://xray-api.onrender.com` |

**Important**: Use the API service URL from Step 2.6.

### 3.4 Deploy Dashboard Service

1. Click **"Create Static Site"**
2. Render will build and deploy
3. Once deployed, note the dashboard URL: `https://xray-dashboard.onrender.com`

### 3.5 Update API CORS Configuration

After dashboard is deployed, update API service:

1. Go to API service → **"Environment"** tab
2. Update `CORS_ORIGIN`:
   ```
   https://xray-dashboard.onrender.com
   ```
3. Add your custom domain if you have one:
   ```
   https://xray-dashboard.onrender.com,https://your-custom-domain.com
   ```
4. Save changes (will trigger redeployment)

---

## 🔧 Step 4: Update CORS Configuration

The CORS middleware should already support `CORS_ORIGIN`. Verify in `packages/server/src/middleware/cors.ts`:

```typescript
const corsEnv = process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS;
const allowedOrigins = corsEnv
  ? corsEnv.split(",").map((o) => o.trim())
  : process.env.NODE_ENV === "production"
    ? []
    : ["*"];
```

This will automatically work with Render's environment variables.

---

## 💾 Step 5: Database Configuration

### 5.1 Database Path

The SQLite database will be stored on the persistent disk:

```
/opt/render/project/src/packages/server/data/xray.db
```

The `SQLiteStore` will:

- ✅ Automatically create the database if it doesn't exist
- ✅ Create the schema on first run
- ✅ Persist data across deployments (thanks to mounted disk)

### 5.2 Database Backups

For production, consider:

1. **Regular Exports**: Periodically export the database
2. **Render Backups**: Render provides disk snapshots (paid plans)
3. **Migration to PostgreSQL**: For production, consider migrating to Render's PostgreSQL

---

## 🌐 Step 6: Custom Domains (Optional)

### 6.1 Add Custom Domain to API

1. Go to API service → **"Settings"** → **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Enter your domain: `api.yourdomain.com`
4. Render will provide DNS records

### 6.2 Add Custom Domain to Dashboard

1. Go to Dashboard service → **"Settings"** → **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Enter your domain: `dashboard.yourdomain.com` or `yourdomain.com`
4. Render will provide DNS records

### 6.3 Update DNS

Add the provided CNAME records to your DNS provider:

```
Type: CNAME
Name: api
Value: xray-api.onrender.com

Type: CNAME
Name: dashboard (or @ for root)
Value: xray-dashboard.onrender.com
```

### 6.4 Update Environment Variables

After DNS propagates, update:

**API Service**:

```
CORS_ORIGIN=https://dashboard.yourdomain.com,https://yourdomain.com
```

**Dashboard Service**:

```
VITE_API_URL=https://api.yourdomain.com
```

---

## ✅ Step 7: Verify Deployment

### 7.1 Health Check

Visit your API service URL:

```
https://xray-api.onrender.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 7.2 Test Authentication

```bash
curl -X POST https://xray-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

Expected response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin"
  }
}
```

### 7.3 Test Dashboard

1. Visit your dashboard URL: `https://xray-dashboard.onrender.com`
2. Log in with default credentials: `admin` / `admin`
3. Verify you can see the dashboard
4. Test creating an execution
5. Verify real-time updates work (WebSocket)

### 7.4 Test API Endpoints

```bash
# Get executions (requires authentication)
TOKEN="your-jwt-token"
curl -X GET https://xray-api.onrender.com/api/executions \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Symptoms**: Build command fails in Render logs

**Common Errors**:

- **TypeScript compilation errors**: Missing type definitions (`@types/node`, `@types/express`, etc.)
- **Module not found**: `@xray/sdk` not found (SDK not built first)
- **Cannot find name 'process'**: Missing Node.js type definitions

**Solutions**:

- **Build from root**: Set `rootDir: .` in render.yaml to build from repository root
- **Build SDK first**: The server's `prebuild` script automatically builds the SDK first, so just use `cd packages/server && npm run build`
- **Include devDependencies**: Use `npm install --include=dev` to install TypeScript and type definitions
- **Verify build order**: SDK must be built before server (monorepo dependency)
- Check Node.js version matches `engines.node` in `package.json`
- Verify build commands work locally: `npm install && npm run build:sdk && npm run build:server`
- Check for TypeScript errors: `npm run build` locally first

**Correct Build Command**:

```bash
npm install --include=dev && cd packages/server && npm run build
```

**Note**: The server's `prebuild` script automatically builds the SDK first, so you only need to build the server.

**Correct Start Command**:

```bash
cd packages/server && npm start
```

### Issue: Service Crashes on Start

**Symptoms**: Service restarts repeatedly

**Solutions**:

- Check deployment logs for error messages
- Verify `PORT` environment variable (Render sets this automatically to `10000`)
- Ensure database path is writable: `/opt/render/project/src/packages/server/data/xray.db`
- Check that disk is mounted correctly
- Verify disk mount path matches `DB_PATH`

### Issue: Database Not Persisting

**Symptoms**: Data disappears after redeployment

**Solutions**:

- Verify disk is mounted at correct path: `/opt/render/project/src/packages/server/data`
- Check `DB_PATH` points to disk path: `/opt/render/project/src/packages/server/data/xray.db`
- Ensure disk is not being cleared on deploy
- Check disk size limits (free tier: 1GB)
- Verify disk is attached to the correct service

### Issue: CORS Errors

**Symptoms**: Dashboard can't connect to API

**Solutions**:

- Verify `CORS_ORIGIN` in API service includes dashboard URL
- Check dashboard `VITE_API_URL` points to correct API URL
- Ensure CORS middleware is configured correctly
- Check browser console for specific CORS error messages
- Verify both services are deployed and running

### Issue: WebSocket Not Working

**Symptoms**: Real-time updates don't work

**Solutions**:

- Verify `ws` package is in `dependencies` (not `devDependencies`)
- Check WebSocket path: `/ws`
- Ensure Render supports WebSockets (it does by default)
- Check browser console for WebSocket connection errors
- Verify API service is running (WebSocket requires the API service)

### Issue: Environment Variables Not Working

**Symptoms**: Variables not available at runtime

**Solutions**:

- Verify variables are set in Render dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding/changing variables
- For Vite apps, variables must start with `VITE_`
- For static sites, rebuild after changing `VITE_` variables

### Issue: Static Site 404 Errors

**Symptoms**: Dashboard shows 404 on refresh or direct URL access

**Solutions**:

- This is normal for SPAs - Render handles this automatically
- If using custom domain, ensure DNS is configured correctly
- Check that `Publish Directory` is set to `dist`
- Verify build completed successfully

### Issue: Out of Memory

**Symptoms**: Service crashes with memory errors

**Solutions**:

- Upgrade Render plan (free tier has memory limits)
- Optimize build process (remove unnecessary dependencies)
- Check for memory leaks in application code
- Consider splitting into more services

### Issue: Build Timeout

**Symptoms**: Build fails due to timeout

**Solutions**:

- Free tier has 15-minute build timeout
- Optimize build: remove unnecessary dependencies
- Use build cache (Render caches `node_modules`)
- Consider upgrading plan for longer build times
- Split build into smaller steps if possible

---

## 📊 Monitoring and Logs

### View Logs

1. Go to your Render service
2. Click on the service
3. View **"Logs"** tab for real-time logs
4. View **"Events"** tab for deployment history

### Metrics

Render provides:

- **CPU Usage**: Monitor resource consumption
- **Memory Usage**: Track memory usage
- **Request Count**: API request metrics
- **Response Times**: Average response time
- **Error Rate**: Percentage of failed requests

### Custom Metrics

Your API includes a metrics endpoint:

```
GET /api/metrics
Authorization: Bearer YOUR_TOKEN
```

Returns:

- Request counts by endpoint
- Error rates
- Response times
- Recent metrics

### Alerts

Set up alerts in Render:

1. Go to service → **"Alerts"** tab
2. Configure email/Slack notifications
3. Set thresholds for:
   - High error rate
   - High response time
   - Service downtime

---

## 🔄 Continuous Deployment

### Automatic Deployments

Render automatically deploys:

- ✅ Push to `main` branch → Production deployment
- ✅ Pull requests → Preview deployments (optional)

### Manual Deployments

1. Go to your service
2. Click **"Manual Deploy"**
3. Select branch/commit
4. Click **"Deploy"**

### Rollback

1. Go to service → **"Events"** tab
2. Find previous successful deployment
3. Click **"Redeploy"**

---

## 💰 Render Pricing

### Free Tier

- **750 hours/month** of service time
- **100 GB bandwidth/month**
- **1 GB persistent disk**
- **15-minute build timeout**
- **Sleeps after 15 minutes of inactivity** (wakes on request)

### Paid Plans

- **Starter**: $7/month per service
  - No sleep
  - 512 MB RAM
  - Faster builds
- **Standard**: $25/month per service
  - 2 GB RAM
  - Better performance
- **Pro**: $85/month per service
  - 4 GB RAM
  - Priority support

**Note**: Free tier services sleep after inactivity. First request after sleep takes ~30 seconds to wake up.

---

## 🎯 Best Practices

### 1. Environment-Specific Configuration

Use different environment variables for:

- Development (local)
- Staging (Render preview)
- Production (Render main)

### 2. Database Backups

For production:

- Set up regular database exports
- Consider migrating to PostgreSQL (Render offers managed PostgreSQL)
- Use Render's disk snapshots (paid plans)

### 3. Security

- ✅ Use strong `JWT_SECRET` (32+ characters)
- ✅ Enable HTTPS (automatic on Render)
- ✅ Restrict CORS origins
- ✅ Use environment variables for secrets
- ✅ Never commit secrets to Git
- ✅ Rotate JWT secrets periodically

### 4. Performance

- ✅ Enable gzip compression (automatic on Render)
- ✅ Use CDN for static assets (automatic for static sites)
- ✅ Implement caching where appropriate
- ✅ Monitor resource usage
- ✅ Optimize build times

### 5. Monitoring

- ✅ Set up error tracking (Sentry, etc.)
- ✅ Monitor API response times
- ✅ Track database size
- ✅ Set up alerts for failures
- ✅ Use Render's built-in metrics

### 6. Cost Optimization

- ✅ Use free tier for development
- ✅ Upgrade only when needed
- ✅ Monitor bandwidth usage
- ✅ Optimize build times
- ✅ Use static site for dashboard (cheaper than web service)

---

## 📝 Complete Configuration Example

### API Service Configuration

**Name**: `xray-api`
**Type**: Web Service
**Root Directory**: `packages/server`
**Build Command**: `npm install && npm run build`
**Start Command**: `npm start`

**Environment Variables**:

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h
DB_PATH=/opt/render/project/src/packages/server/data/xray.db
CORS_ORIGIN=https://xray-dashboard.onrender.com
```

**Disk**:

- Name: `xray-db`
- Mount Path: `/opt/render/project/src/packages/server/data`
- Size: 1 GB

### Dashboard Service Configuration

**Name**: `xray-dashboard`
**Type**: Static Site
**Root Directory**: `packages/dashboard`
**Build Command**: `npm install && npm run build`
**Publish Directory**: `dist`

**Environment Variables**:

```bash
VITE_API_URL=https://xray-api.onrender.com
```

---

## 🎉 Success!

Once deployed, your X-Ray system will be available at:

- **API**: `https://xray-api.onrender.com`
- **Dashboard**: `https://xray-dashboard.onrender.com`
- **Health Check**: `https://xray-api.onrender.com/api/health`
- **WebSocket**: `wss://xray-api.onrender.com/ws`

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)
- [X-Ray Project README](./README.md)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Render deployment logs
2. Verify environment variables are set correctly
3. Test locally first: `npm run build && npm start`
4. Check [Render Status](https://status.render.com)
5. Review this guide's troubleshooting section
6. Check Render community forums

---

## 🔄 Migration from Other Platforms

### From Railway

1. Export environment variables from Railway
2. Create services in Render (follow this guide)
3. Update CORS and API URLs
4. Test thoroughly before switching DNS

### From Vercel

1. Vercel is frontend-only, so you'll need to deploy API separately
2. Follow this guide for full-stack deployment
3. Update `VITE_API_URL` to point to Render API

---

**Happy Deploying! 🚀**
