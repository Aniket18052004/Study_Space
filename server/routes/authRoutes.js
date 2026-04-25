import express from 'express'
import { body } from 'express-validator'
import passport from 'passport'
import {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
} from '../controllers/authController.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { uploadAvatar } from '../middleware/upload.js'
import generateToken from '../utils/generateToken.js'

const router = express.Router()

// ── Validation rules ──────────────────────────────────────────
const registerRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['student', 'teacher'])
        .withMessage('Role must be student or teacher'),
]

const loginRules = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
]

// ── Email / Password routes ───────────────────────────────────
router.post('/register', registerRules, register)
router.post('/login', loginRules, login)

// ── Protected routes ──────────────────────────────────────────
router.get('/me', verifyToken, getMe)
router.put('/update-profile', verifyToken, uploadAvatar, updateProfile)
router.put('/change-password', verifyToken, changePassword)

// ── Google OAuth routes ───────────────────────────────────────
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login`,
    }),
    (req, res) => {
        // On success — generate token and redirect to frontend
        const token = generateToken(req.user._id)
        res.redirect(
            `${process.env.CLIENT_URL}/auth/callback?token=${token}`
        )
    }
)

export default router