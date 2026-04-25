import express from 'express'
import {
    getCourses,
    getCourseById,
    getTeacherCourses,
    createCourse,
    updateCourse,
    publishCourse,
    unpublishCourse,
    deleteCourse,
} from '../controllers/courseController.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { uploadImage } from '../middleware/upload.js'

const router = express.Router()

// ── Public routes ─────────────────────────────────────────────
router.get('/', getCourses)
router.get('/:id', getCourseById)

// ── Teacher only routes ───────────────────────────────────────
router.get(
    '/teacher/my',
    verifyToken,
    roleGuard('teacher'),
    getTeacherCourses
)

router.post(
    '/',
    verifyToken,
    roleGuard('teacher'),
    uploadImage,
    createCourse
)

router.put(
    '/:id',
    verifyToken,
    roleGuard('teacher'),
    uploadImage,
    updateCourse
)

router.patch(
    '/:id/publish',
    verifyToken,
    roleGuard('teacher'),
    publishCourse
)

router.patch(
    '/:id/unpublish',
    verifyToken,
    roleGuard('teacher'),
    unpublishCourse
)

router.delete(
    '/:id',
    verifyToken,
    roleGuard('teacher'),
    deleteCourse
)

export default router