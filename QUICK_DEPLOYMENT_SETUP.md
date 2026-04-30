# Quick Setup Guide - Study_Space Deployment

## 🎯 Your Current URLs (After Deployment)
- **Backend (Render)**: `https://study-space-server.onrender.com`
- **Frontend (Vercel)**: `https://your-project-name.vercel.app`

---

## 📝 QUICK STEPS TO DEPLOY

### STEP 1: Backend Deployment (Render) - Takes 5 mins
```
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New+" → "Web Service"
4. Connect your Study_Space repository
5. Fill in:
   - Name: study-space-server
   - Root Directory: server
   - Build Command: npm install
   - Start Command: npm start
6. Go to "Environment" tab
7. Add ALL variables from server/.env.example
   - Copy values from your local .env file
   - Add your credentials for MongoDB, Google, Cloudinary, etc.
8. Click "Deploy"
9. Wait 3-5 minutes ✅
```

**Your backend URL will be shown after deployment!**

---

### STEP 2: Update Frontend for Production
```
1. Get your Render backend URL (from Step 1)
2. Edit client/.env.production
   VITE_API_URL=https://your-backend-url.onrender.com
3. Save and commit to Git
```

---

### STEP 3: Frontend Deployment (Vercel) - Takes 3 mins
```
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Select your Study_Space repository
5. Configure:
   - Framework: Vite
   - Root Directory: client
   - Build Command: npm run build
   - Output Directory: dist
6. Go to "Environment Variables"
7. Add: VITE_API_URL = (your Render backend URL from Step 1)
8. Click "Deploy"
9. Wait 2-3 minutes ✅
```

---

## 🔑 Environment Variables Quick Reference

### Server (.env)
| Variable | Value | Where to Get |
|----------|-------|--------------|
| MONGODB_URI | Your MongoDB connection string | MongoDB Atlas |
| JWT_SECRET | Random string (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) | Generate yourself |
| CLIENT_URL | http://localhost:5173 (dev) or https://your-vercel.app (prod) | Your Vercel URL |
| GOOGLE_CLIENT_ID | From Google Cloud Console | https://console.cloud.google.com |
| GOOGLE_CLIENT_SECRET | From Google Cloud Console | https://console.cloud.google.com |
| CLOUDINARY_CLOUD_NAME | From Cloudinary Dashboard | https://cloudinary.com |
| CLOUDINARY_API_KEY | From Cloudinary Dashboard | https://cloudinary.com |
| CLOUDINARY_API_SECRET | From Cloudinary Dashboard | https://cloudinary.com |
| EMAIL_USER | Your Gmail | your-email@gmail.com |
| EMAIL_PASS | Gmail App Password (16 chars) | https://myaccount.google.com/apppasswords |

### Client (.env.production)
| Variable | Value |
|----------|-------|
| VITE_API_URL | https://your-backend.onrender.com |

---

## 🔄 How It Works

```
User Browser (Vercel)
        ↓
Frontend: https://your-app.vercel.app
        ↓
Axios: import.meta.env.VITE_API_URL
        ↓
Backend: https://your-backend.onrender.com
        ↓
MongoDB: Your Database
```

---

## ⚠️ IMPORTANT PRODUCTION SETTINGS

### 1. Update Google OAuth Redirect URI
- Go to: https://console.cloud.google.com
- Update Authorized Redirect URI to: `https://your-backend.onrender.com/api/auth/google/callback`

### 2. Update Cloudinary Settings
- Ensure CORS is configured if needed

### 3. Update Gmail App Password
- Enable 2FA on Gmail
- Generate App Password at: https://myaccount.google.com/apppasswords

### 4. Update MongoDB IP Whitelist
- Go to MongoDB Atlas
- Security → Network Access
- Add Render IP or allow all IPs (0.0.0.0/0)

---

## 🧪 TEST YOUR DEPLOYMENT

1. Open: https://your-app.vercel.app
2. Try logging in / registering
3. Check browser DevTools → Network tab
4. Verify requests go to your Render backend URL
5. Check Render logs for any errors

---

## ❌ COMMON ISSUES & FIXES

### "CORS Error" or "Cannot reach backend"
- Check CLIENT_URL in server .env matches your Vercel URL
- Check VITE_API_URL in client .env.production is correct
- Restart/redeploy both services

### "Login doesn't work"
- Check JWT_SECRET is same in local and Render
- Check CLIENT_URL in server CORS matches frontend URL
- Check Google OAuth redirect URI is updated

### "Images not uploading"
- Check Cloudinary credentials in Render environment
- Check Cloudinary API key is correct

---

## 📚 Files Changed
- ✅ client/.env.local - Development config
- ✅ client/.env.production - Production config
- ✅ client/.env.example - Template (commit to git)
- ✅ client/src/utils/axiosInstance.js - Now uses env variables
- ✅ server/.env.example - Template (commit to git)
- ✅ DEPLOYMENT_GUIDE.md - Complete guide

---

## 🎉 After Everything Works

1. Commit all changes:
   ```
   git add .
   git commit -m "Add deployment configuration for Vercel and Render"
   git push
   ```

2. Your app is now live! 🚀

---

## 📞 STILL NEED HELP?

Common issues are in the Render/Vercel logs:
- **Render**: Logs tab in service dashboard
- **Vercel**: Deployments tab → click latest deployment

Check logs for specific error messages!
