import express from 'express'
import {
    addLesson,
    getLessonById,
    updateLesson,
    deleteLesson,
    reorderLessons,
} from '../controllers/lessonController.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { uploadVideo } from '../middleware/upload.js'

const router = express.Router()

// ── Teacher only routes ───────────────────────────────────────
router.post(
    '/',
    verifyToken,
    roleGuard('teacher'),
    uploadVideo,
    addLesson
)

router.patch(
    '/reorder',
    verifyToken,
    roleGuard('teacher'),
    reorderLessons
)

router.put(
    '/:id',
    verifyToken,
    roleGuard('teacher'),
    uploadVideo,
    updateLesson
)

router.delete(
    '/:id',
    verifyToken,
    roleGuard('teacher'),
    deleteLesson
)

// ── Protected route (student + teacher) ──────────────────────
router.get(
    '/:id',
    verifyToken,
    getLessonById
)

export default router