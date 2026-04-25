import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const verifyToken = async (req, res, next) => {
    try {
        // Token comes in header as: "Bearer eyJhbGci..."
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No token provided. Please login first.',
            })
        }

        const token = authHeader.split(' ')[1]

        // Verify token using JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Find user in database and attach to request
        const user = await User.findById(decoded.id).select('-password')

        if (!user) {
            return res.status(401).json({
                message: 'User not found. Token may be invalid.',
            })
        }

        req.user = user
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired. Please login again.',
            })
        }
        return res.status(401).json({
            message: 'Invalid token. Please login again.',
        })
    }
}