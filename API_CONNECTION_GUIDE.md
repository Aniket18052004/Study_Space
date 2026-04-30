# API Connection Guide - Frontend ↔ Backend

## 🔗 How Your Frontend & Backend Connect

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION DEPLOYMENT                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐           INTERNET          ┌──────────────────────────┐
│  VERCEL FRONTEND         │                             │   RENDER BACKEND         │
│ https://app.vercel.app   │◄──────── HTTPS ────────────►│ https://app.render.com   │
│                          │                             │                          │
│ React/Vite              │                             │ Node.js/Express          │
│ Port: 443 (HTTPS)       │                             │ Port: 443 (HTTPS)        │
│                          │                             │                          │
│ client/.env.production   │                             │ server/.env              │
│ VITE_API_URL=...        │                             │ CLIENT_URL=...           │
│ PORT=443                 │                             │ MONGODB_URI=...          │
└──────────┬───────────────┘                             └────────┬─────────────────┘
           │                                                      │
           │ Makes API Request                                    │ Receives Request
           │ axiosInstance.get('/api/courses')                   │ Processes Data
           │                                                      │ Queries MongoDB
           ▼                                                      ▼
```

---

## 📡 Request Flow - Step by Step

### 1️⃣ User Action in Browser
```javascript
// components/CourseCard.jsx
import axiosInstance from '../utils/axiosInstance'

function CourseCard() {
  async function loadCourses() {
    try {
      const response = await axiosInstance.get('/api/courses')
      // axios automatically prepends baseURL
      // Full URL: https://app.render.com/api/courses
    } catch (error) {
      console.error('Failed to load courses')
    }
  }
}
```

### 2️⃣ How baseURL Works

**Development (npm run dev)**
```
VITE_API_URL = http://localhost:5000
axiosInstance = axios.create({
  baseURL: 'http://localhost:5000'  // ← from .env.local
})
Request: http://localhost:5000/api/courses
```

**Production (deployed on Vercel)**
```
VITE_API_URL = https://study-space-server.onrender.com
axiosInstance = axios.create({
  baseURL: 'https://study-space-server.onrender.com'  // ← from .env.production
})
Request: https://study-space-server.onrender.com/api/courses
```

### 3️⃣ Request Headers Added
```javascript
// All requests automatically include:
Authorization: Bearer <JWT_TOKEN>  // From localStorage
Content-Type: application/json
Origin: https://your-frontend.vercel.app
Cookie: <session_cookies>
```

### 4️⃣ Server Receives & Processes
```javascript
// server/routes/courseRoutes.js
router.get('/courses', async (req, res) => {
  // 1. Verify JWT token (middleware)
  // 2. Query MongoDB
  // 3. Return JSON response
  res.json({ courses: [...] })
})
```

### 5️⃣ CORS Validation Happens
```javascript
// server/server.js
cors({
  origin: process.env.CLIENT_URL,  // Must match frontend URL
  credentials: true,               // Allow cookies/auth headers
})

// If CLIENT_URL = https://your-app.vercel.app
// ✅ Request from https://your-app.vercel.app → ALLOWED
// ❌ Request from https://other-domain.com → BLOCKED
```

### 6️⃣ Response Returned to Frontend
```javascript
// Backend sends:
{
  "success": true,
  "courses": [
    { "id": 1, "title": "React Basics", ... },
    { "id": 2, "title": "Advanced React", ... }
  ]
}

// Frontend receives in the response handler:
response.data.courses // [ {...}, {...} ]
```

---

## 📊 Environment Variables Flow

```
┌─────────────────────────────────────────────────────────┐
│           Frontend Environment Variables               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Development Mode (npm run dev)                         │
│  ├─ .env.local → VITE_API_URL=http://localhost:5000   │
│  └─ Result: Connects to local backend                   │
│                                                         │
│  Production Mode (npm run build + deployed to Vercel)  │
│  ├─ .env.production → VITE_API_URL=https://...render..│
│  └─ Result: Connects to Render backend                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            Backend Environment Variables               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Local Development (.env file)                          │
│  ├─ CLIENT_URL=http://localhost:5173                   │
│  ├─ MONGODB_URI=mongodb://...                          │
│  ├─ JWT_SECRET=your_secret                             │
│  └─ GOOGLE_CALLBACK_URL=http://localhost:5000/...     │
│                                                         │
│  Production (Render Dashboard Environment Variables)   │
│  ├─ CLIENT_URL=https://your-app.vercel.app            │
│  ├─ MONGODB_URI=mongodb://...                          │
│  ├─ JWT_SECRET=your_secret (SAME as local!)            │
│  └─ GOOGLE_CALLBACK_URL=https://...render.../...      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 CORS (Cross-Origin Resource Sharing)

### The Problem
```
Frontend: https://your-app.vercel.app (Domain A)
Backend:  https://your-backend.render.com (Domain B)

Browser Security: "Different domains = Blocked by default"
```

### The Solution - Configure CORS on Backend
```javascript
// server/server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.CLIENT_URL,  // ✅ Allow only this domain
  credentials: true,                // ✅ Allow auth headers & cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Example VALUES:
// Development: origin: 'http://localhost:5173'
// Production: origin: 'https://your-app.vercel.app'
```

### Headers Sent During CORS Check
```
Browser sends:
  Origin: https://your-app.vercel.app

Server responds:
  Access-Control-Allow-Origin: https://your-app.vercel.app ✅
  Access-Control-Allow-Credentials: true
```

---

## 🚀 API Endpoints Example

### Course APIs
```
GET    /api/courses              → Get all courses
GET    /api/courses/:id          → Get specific course
POST   /api/courses              → Create course (teacher only)
PUT    /api/courses/:id          → Update course (teacher only)
DELETE /api/courses/:id          → Delete course (teacher only)
```

### Authentication APIs
```
POST   /api/auth/register         → Register user
POST   /api/auth/login            → Login user
POST   /api/auth/logout           → Logout user
POST   /api/auth/google           → Google OAuth login
GET    /api/auth/google/callback  → OAuth callback
POST   /api/auth/refresh-token    → Refresh JWT
```

### Full Request Example
```javascript
// Frontend
const response = await axiosInstance.post('/api/auth/login', {
  email: 'user@gmail.com',
  password: 'password123'
})

// Full URL sent:
// POST https://study-space-server.onrender.com/api/auth/login
// With body: { email, password }
// With headers: { Authorization: Bearer ..., Content-Type: application/json }
```

---

## 🔑 JWT Token Flow

```
1. User Logs In
   └─ Frontend: axiosInstance.post('/api/auth/login', credentials)
   └─ Backend: Validates email/password → Generates JWT → Sends back

2. Token Stored in Frontend
   └─ localStorage.setItem('token', jwtToken)

3. Every Subsequent Request
   └─ Interceptor: "If token exists, add to Authorization header"
   └─ axios config: Authorization: Bearer <token>

4. Backend Validates Token
   └─ Middleware: Extracts token from header → Verifies signature
   └─ If valid: Allows request to proceed
   └─ If invalid/expired: Returns 401 → Frontend redirects to login

5. Token Expiration
   └─ After 7 days (JWT_EXPIRES_IN=7d)
   └─ User must login again
```

---

## 📋 Your Current Configuration

### Frontend (client/)
```
✅ axiosInstance.js
   - baseURL: import.meta.env.VITE_API_URL
   - Has request interceptor to add JWT token
   - Has response interceptor to handle 401 errors

✅ .env.local (development)
   - VITE_API_URL=http://localhost:5000

✅ .env.production (production)
   - VITE_API_URL=https://study-space-server.onrender.com
```

### Backend (server/)
```
✅ server.js
   - CORS configured with process.env.CLIENT_URL
   - Listens on process.env.PORT

✅ .env (local)
   - CLIENT_URL=http://localhost:5173
   - All credentials for MongoDB, Google, Cloudinary, Email
```

---

## ✅ Checklist Before Deploying

- [ ] axiosInstance.js uses `import.meta.env.VITE_API_URL`
- [ ] client/.env.production has correct backend URL
- [ ] server/server.js uses `process.env.CLIENT_URL` for CORS
- [ ] server/.env has all credentials filled
- [ ] JWT_SECRET is set in server/.env
- [ ] MONGODB_URI is set in server/.env
- [ ] All .env files are in .gitignore (not committed)
- [ ] .env.example files ARE committed (without secrets)
- [ ] Google OAuth callback URLs updated for production
- [ ] Cloudinary credentials are correct
- [ ] Email credentials are correct

---

## 🧪 Testing API Connection

### Local Testing
```bash
# Terminal 1: Start backend
cd server
npm start
# Runs on http://localhost:5000

# Terminal 2: Start frontend
cd client
npm run dev
# Runs on http://localhost:5173

# Open browser: http://localhost:5173
# Try logging in / making API calls
# Check Network tab to see requests going to localhost:5000
```

### Production Testing
```
1. Open https://your-app.vercel.app
2. Open DevTools (F12) → Network tab
3. Try logging in / making API calls
4. Verify requests go to https://your-backend.render.com
5. Check for CORS errors in Console
6. Check Render logs for backend errors
```

---

## ❌ Common Issues & Solutions

### Issue: "CORS Error - No 'Access-Control-Allow-Origin' header"
**Cause**: CLIENT_URL in server .env doesn't match frontend URL
**Fix**:
```javascript
// server/.env
CLIENT_URL=https://your-actual-vercel-url.app  // Update this!
```

### Issue: "Cannot reach backend" / "Network Error"
**Cause**: VITE_API_URL is wrong or backend is down
**Fix**:
```javascript
// client/.env.production
VITE_API_URL=https://your-actual-render-url.onrender.com  // Check this!
```

### Issue: "Login works in development but not production"
**Cause**: JWT_SECRET is different or CORS not configured
**Fix**:
```javascript
// server/.env (production on Render)
JWT_SECRET=same_value_as_local_development  // Must be IDENTICAL!
CLIENT_URL=https://your-vercel-app.vercel.app  // Must match frontend
```

### Issue: "Images not uploading"
**Cause**: Cloudinary credentials not set on Render
**Fix**: Add to Render environment variables:
```
CLOUDINARY_CLOUD_NAME=your_value
CLOUDINARY_API_KEY=your_value
CLOUDINARY_API_SECRET=your_value
```

---

## 📚 Summary

| Aspect | Details |
|--------|---------|
| **Frontend URL** | https://your-app.vercel.app |
| **Backend URL** | https://your-backend.onrender.com |
| **How they connect** | axiosInstance baseURL points to backend |
| **CORS** | Configured on backend to allow frontend domain |
| **JWT** | Frontend stores, sends with every request |
| **Environment** | Frontend uses .env.production, Backend uses Render dashboard |
| **Database** | Both connect to same MongoDB Atlas instance |

Everything is set up correctly! Ready to deploy! 🚀
