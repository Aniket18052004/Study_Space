import express from 'express'
import {
    createOrder,
    verifyPayment,
    getMyPayments,
    getTeacherRevenue,
} from '../controllers/paymentController.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = express.Router()

// ── Student routes ────────────────────────────────────────────
router.post(
    '/create-order',
    verifyToken,
    roleGuard('student'),
    createOrder
)

router.post(
    '/verify',
    verifyToken,
    roleGuard('student'),
    verifyPayment
)

router.get(
    '/my',
    verifyToken,
    roleGuard('student'),
    getMyPayments
)

// ── Teacher routes ────────────────────────────────────────────
router.get(
    '/teacher/revenue',
    verifyToken,
    roleGuard('teacher'),
    getTeacherRevenue
)

export default router