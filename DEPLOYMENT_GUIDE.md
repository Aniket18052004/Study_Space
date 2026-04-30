# Study_Space Deployment Guide

## Project Structure Overview
- **Backend**: Node.js/Express server (port 5000)
- **Frontend**: React/Vite client (port 5173)
- **Database**: MongoDB Atlas (cloud database)

---

## PART 1: BACKEND DEPLOYMENT ON RENDER

### Step 1: Prepare Your Backend for Deployment

#### 1.1 Check your `server/package.json`
Make sure it has:
```json
{
  "name": "study-space-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

#### 1.2 Update `server/server.js` for production
Ensure your server listens on the PORT environment variable:
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 1.3 Create `server/.env.example`
List all required environment variables (don't include actual values):
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GMAIL_USER=your_gmail
GMAIL_PASS=your_gmail_app_password
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 1.4 Create `.gitignore` in server folder (if not exists)
```
node_modules/
.env
.env.local
.env.*.local
```

### Step 2: Create Render Account & Deploy Backend

#### 2.1 Sign up on Render
- Go to [https://render.com](https://render.com)
- Sign up with GitHub (recommended)
- Connect your GitHub repository

#### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository (Study_Space)
3. Fill in service details:
   - **Name**: study-space-server
   - **Root Directory**: server
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### 2.3 Set Environment Variables
1. Go to "Environment" section
2. Add all variables from `.env.example`:
   - MONGODB_URI
   - JWT_SECRET
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - GMAIL_USER
   - GMAIL_PASS
   - GOOGLE_OAUTH_CLIENT_ID
   - GOOGLE_OAUTH_CLIENT_SECRET
   - GOOGLE_OAUTH_CALLBACK_URL (e.g., https://study-space-server.onrender.com/api/auth/google/callback)
   - FRONTEND_URL (you'll add this after deploying frontend)

#### 2.4 Deploy
- Click "Deploy"
- Wait 3-5 minutes for build to complete
- Your backend URL: `https://study-space-server.onrender.com`

---

## PART 2: FRONTEND DEPLOYMENT ON VERCEL

### Step 1: Prepare Your Frontend for Deployment

#### 1.1 Update `client/vite.config.js`
Make sure it's properly configured:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

#### 1.2 Create `client/.env.example`
```
VITE_API_URL=https://study-space-server.onrender.com
```

#### 1.3 Create `client/.env.production`
```
VITE_API_URL=https://study-space-server.onrender.com
```

#### 1.4 Update `client/src/utils/axiosInstance.js`
Make sure it uses the environment variable:
```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

export default axiosInstance;
```

#### 1.5 Update `client/package.json`
Ensure build script is correct:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 1.6 Check `client/.gitignore`
```
# dependencies
node_modules/
.npm

# production
/build
/dist

# misc
.env
.env.local
.env.production
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### Step 2: Deploy Frontend on Vercel

#### 2.1 Sign up on Vercel
- Go to [https://vercel.com](https://vercel.com)
- Sign up with GitHub (recommended)

#### 2.2 Import Project
1. Click "Add New..." → "Project"
2. Select your Study_Space repository
3. Vercel auto-detects it's a monorepo

#### 2.3 Configure Settings
1. **Framework Preset**: Vite
2. **Root Directory**: client
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

#### 2.4 Set Environment Variables
1. Go to "Environment Variables"
2. Add `VITE_API_URL` = `https://study-space-server.onrender.com`
3. Click "Save"

#### 2.5 Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your frontend URL: `https://your-project-name.vercel.app`

---

## PART 3: HOW API CONNECTION WORKS

### Frontend to Backend Connection Flow

```
┌──────────────────┐
│  React Component │
│   (Client)       │
└────────┬─────────┘
         │ 1. Makes API call
         │ (e.g., axiosInstance.get('/api/courses'))
         ▼
┌──────────────────────────────────┐
│ axiosInstance                     │
│ baseURL: VITE_API_URL             │
│ (https://study-space-server....) │
└────────┬─────────────────────────┘
         │ 2. HTTP Request sent over internet
         │
         ▼
┌──────────────────────────────────┐
│  Express Server on Render         │
│  (Backend - Port 5000)            │
│  - Receives request               │
│  - Processes data                 │
│  - Queries MongoDB                │
└────────┬─────────────────────────┘
         │ 3. Sends response (JSON)
         │
         ▼
┌──────────────────────────────────┐
│  React Component                  │
│  - Receives data                  │
│  - Updates state                  │
│  - Re-renders UI                  │
└──────────────────────────────────┘
```

### Example API Call in React Component

**Before (Local Development):**
```javascript
// client/src/components/CourseCard.jsx
import axiosInstance from '../utils/axiosInstance';

export function getCourses() {
  // baseURL: http://localhost:5000
  return axiosInstance.get('/api/courses');
}
```

**After (Production on Vercel):**
```javascript
// Same code! 
// baseURL automatically switches to: https://study-space-server.onrender.com
// axiosInstance.js uses: import.meta.env.VITE_API_URL
```

### CORS Configuration

Update `server/server.js` to allow Vercel frontend:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173', // Development
    'https://your-project-name.vercel.app' // Production
  ],
  credentials: true
}));
```

---

## PART 4: ENVIRONMENT FILES SETUP

### Local Development Flow

**client/.env.local** (Development - stays on your computer)
```
VITE_API_URL=http://localhost:5000
```

**client/.env.production** (Production - deployed to Vercel)
```
VITE_API_URL=https://study-space-server.onrender.com
```

**server/.env** (Local - stays on your computer)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
```

### Environment Variable Hierarchy

**Frontend (Vite)**
1. `.env.production` - Used when running `npm run build`
2. `.env.development` - Used when running `npm run dev`
3. `.env` - Fallback (should have defaults)

**Backend (Node.js)**
1. Environment variables set in Render dashboard (highest priority)
2. `.env` file in local development
3. Default values in code (lowest priority)

---

## PART 5: COMPLETE DEPLOYMENT CHECKLIST

### Backend (Render) Checklist:
- [ ] Server listens to `process.env.PORT`
- [ ] All environment variables listed in `.env.example`
- [ ] MongoDB connection string is set in Render
- [ ] CORS allows Vercel frontend URL
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Root directory: `server`

### Frontend (Vercel) Checklist:
- [ ] `axiosInstance.js` uses `import.meta.env.VITE_API_URL`
- [ ] `.env.production` has correct backend URL
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Root directory: `client`
- [ ] Environment variable `VITE_API_URL` set in Vercel
- [ ] All API calls work in production

### General Checklist:
- [ ] Git repository is up to date
- [ ] All changes committed
- [ ] `.env` files added to `.gitignore`
- [ ] `node_modules` added to `.gitignore`
- [ ] No hardcoded localhost URLs in production code

---

## PART 6: TROUBLESHOOTING

### Frontend Can't Connect to Backend
**Error**: Network request fails / CORS error
**Solution**:
1. Check `VITE_API_URL` in Vercel environment variables
2. Check CORS in `server/server.js` includes Vercel URL
3. Check backend is actually running on Render
4. Open browser DevTools → Network tab to see requests

### Build Fails on Vercel
**Error**: `npm run build` fails
**Solution**:
1. Run `npm run build` locally in `client` folder
2. Check all env variables are set
3. Check `vite.config.js` is correct
4. Clear Vercel cache and redeploy

### Build Fails on Render
**Error**: `npm install` or `npm start` fails
**Solution**:
1. Run `npm install` locally in `server` folder
2. Check `server.js` runs without errors: `node server.js`
3. Check Node version in Render matches `package.json`
4. Check all MongoDB and API credentials are correct

---

## PART 7: AFTER DEPLOYMENT

### Update Backend URL
1. Go to Render, get your backend URL
2. Update in Vercel environment variables: `VITE_API_URL`
3. Update in `server/server.js` CORS: add Vercel frontend URL
4. Redeploy both

### Monitor Deployments
- **Vercel**: Deployments tab shows all builds
- **Render**: Logs tab shows server activity

### Custom Domain (Optional)
- **Vercel**: Settings → Domains → Add custom domain
- **Render**: Settings → Custom Domain

---

## USEFUL LINKS

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas Connection](https://www.mongodb.com/docs/atlas/)

---

## EXAMPLE PRODUCTION URLS

After deployment, your URLs will be:
- **Backend**: `https://study-space-server.onrender.com`
- **Frontend**: `https://study-space.vercel.app`

Update these everywhere needed (CORS, env variables, callbacks).
