import express from 'express'
import {
    enrollFree,
    getMyEnrollments,
    checkEnrollment,
    markLessonComplete,
    unmarkLessonComplete,
    getCourseStudents,
} from '../controllers/enrollmentController.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = express.Router()

// ── Student routes ────────────────────────────────────────────
router.post(
    '/:courseId',
    verifyToken,
    roleGuard('student'),
    enrollFree
)

router.get(
    '/my',
    verifyToken,
    roleGuard('student'),
    getMyEnrollments
)

router.patch(
    '/:courseId/progress',
    verifyToken,
    roleGuard('student'),
    markLessonComplete
)

router.patch(
    '/:courseId/unmark',
    verifyToken,
    roleGuard('student'),
    unmarkLessonComplete
)

// ── Any authenticated user ────────────────────────────────────
router.get(
    '/:courseId/check',
    verifyToken,
    checkEnrollment
)

// ── Teacher routes ────────────────────────────────────────────
router.get(
    '/teacher/students',
    verifyToken,
    roleGuard('teacher'),
    getCourseStudents
)

export default router