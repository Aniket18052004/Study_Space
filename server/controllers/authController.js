import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { sendWelcomeEmail } from '../utils/sendEmail.js'
import { validationResult } from 'express-validator'

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
export const register = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(e => e.msg).join(', ')
        return res.status(400).json({ message: errorMessages })
    }

    const { name, email, password, role } = req.body

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.status(400).json({
            message: 'Email already registered. Please login instead.',
        })
    }

    // Create user — password auto-hashed by model pre-save hook
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'student',
    })

    // Send welcome email — non-blocking
    sendWelcomeEmail(user.email, user.name).catch(console.error)

    // Generate JWT and respond
    const token = generateToken(user._id)

    res.status(201).json({
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
        },
    })
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
export const login = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(e => e.msg).join(', ')
        return res.status(400).json({ message: errorMessages })
    }

    const { email, password } = req.body

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return res.status(401).json({
            message: 'Invalid email or password.',
        })
    }

    // Check if user registered via Google
    if (user.authMethod === 'google') {
        return res.status(400).json({
            message: 'This account uses Google login. Please click Continue with Google.',
        })
    }

    // Compare password
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
        return res.status(401).json({
            message: 'Invalid email or password.',
        })
    }

    const token = generateToken(user._id)

    res.json({
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
        },
    })
}

// ─────────────────────────────────────────────
// GET /api/auth/me  [protected]
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {
    // req.user is set by verifyToken middleware
    res.json(req.user)
}

// ─────────────────────────────────────────────
// PUT /api/auth/update-profile  [protected]
// ─────────────────────────────────────────────
export const updateProfile = async (req, res) => {
    const { name, bio, phone } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (bio) updateData.bio = bio
    if (phone) updateData.phone = phone

    // If avatar was uploaded via Cloudinary
    if (req.file) {
        updateData.avatar = req.file.path
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
    ).select('-password')

    res.json(user)
}

// ─────────────────────────────────────────────
// PUT /api/auth/change-password  [protected]
// ─────────────────────────────────────────────
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: 'Both current and new password are required.',
        })
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            message: 'New password must be at least 6 characters.',
        })
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password')

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
        return res.status(400).json({
            message: 'Current password is incorrect.',
        })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully.' })
}