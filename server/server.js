import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import 'express-async-errors'
import connectDB from './config/db.js'
import './config/passport.js'
import passport from 'passport'

import authRoutes from './routes/authRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import lessonRoutes from './routes/lessonRoutes.js'
import enrollmentRoutes from './routes/enrollmentRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

// ── Connect to MongoDB ─────────────────────────────────────────
connectDB()

const app = express()

// ── Security middleware ────────────────────────────────────────
app.use(helmet())

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}))

// ── Rate limiting ──────────────────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again after 15 minutes',
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts, please try again later',
})

app.use('/api', generalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// ── Body parsers ───────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(passport.initialize())

// ── Root endpoint ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: 'StudySpace API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            courses: '/api/courses',
            lessons: '/api/lessons',
            enrollments: '/api/enrollments',
            payments: '/api/payments',
        },
    })
})

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'StudySpace API is running',
        timestamp: new Date().toISOString(),
    })
})

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/payments', paymentRoutes)

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
        hint: 'All API routes must start with /api. Available endpoints: /api/auth, /api/courses, /api/lessons, /api/enrollments, /api/payments',
        availableEndpoints: {
            root: 'GET /',
            health: 'GET /api/health',
            auth: 'POST /api/auth/login, POST /api/auth/register',
            courses: 'GET /api/courses, POST /api/courses',
            lessons: 'GET /api/lessons',
            enrollments: 'POST /api/enrollments/enroll/:courseId',
            payments: 'POST /api/payments/order',
        },
    })
})

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message)
    const status = err.status || err.statusCode || 500
    res.status(status).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
})

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📦 Environment: ${process.env.NODE_ENV}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
})