import Lesson from '../models/Lesson.js'
import Course from '../models/Course.js'
import { cloudinary } from '../middleware/upload.js'

// ─────────────────────────────────────────────
// POST /api/lessons  — Teacher only
// Add a new lesson to a course
// ─────────────────────────────────────────────
export const addLesson = async (req, res) => {
    const {
        title,
        courseId,
        order,
        isFree,
        notes,
        duration,
    } = req.body

    if (!title || !courseId || !order) {
        return res.status(400).json({
            message: 'Title, courseId and order are required.',
        })
    }

    // Make sure this course belongs to the teacher
    const course = await Course.findOne({
        _id: courseId,
        teacher: req.user._id,
    })

    if (!course) {
        return res.status(403).json({
            message: 'Course not found or you are not authorized.',
        })
    }

    // Create lesson
    const lesson = await Lesson.create({
        title,
        course: courseId,
        order: Number(order),
        isFree: isFree === 'true' || isFree === true,
        notes: notes || '',
        duration: Number(duration) || 0,
        videoUrl: req.file?.path || '',
        publicId: req.file?.filename || '',
    })

    // Add lesson to course lessons array
    await Course.findByIdAndUpdate(courseId, {
        $push: { lessons: lesson._id },
        $inc: { totalDuration: lesson.duration },
    })

    res.status(201).json(lesson)
}

// ─────────────────────────────────────────────
// GET /api/lessons/:id  — Protected
// Get single lesson with video URL
// ─────────────────────────────────────────────
export const getLessonById = async (req, res) => {
    const lesson = await Lesson.findById(req.params.id)
        .populate('course', 'title teacher enrolledStudents')

    if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found.' })
    }

    // Check if user is teacher of this course OR enrolled student
    const isTeacher = lesson.course.teacher.toString() === req.user._id.toString()
    const isEnrolled = lesson.course.enrolledStudents
        .map(id => id.toString())
        .includes(req.user._id.toString())

    // Free lessons are accessible to everyone logged in
    if (!lesson.isFree && !isTeacher && !isEnrolled) {
        return res.status(403).json({
            message: 'Please enroll in this course to access lessons.',
        })
    }

    res.json(lesson)
}

// ─────────────────────────────────────────────
// PUT /api/lessons/:id  — Teacher only
// Update lesson details or replace video
// ─────────────────────────────────────────────
export const updateLesson = async (req, res) => {
    const lesson = await Lesson.findById(req.params.id)
        .populate('course', 'teacher')

    if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found.' })
    }

    // Only course teacher can update
    if (lesson.course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: 'Not authorized. You can only edit your own lessons.',
        })
    }

    // If new video uploaded — delete old one from Cloudinary first
    if (req.file) {
        if (lesson.publicId) {
            await cloudinary.uploader.destroy(lesson.publicId, {
                resource_type: 'video',
            })
        }
        lesson.videoUrl = req.file.path
        lesson.publicId = req.file.filename
    }

    // Update other fields
    const { title, order, isFree, notes, duration } = req.body

    if (title) lesson.title = title
    if (order) lesson.order = Number(order)
    if (notes) lesson.notes = notes
    if (duration) lesson.duration = Number(duration)

    if (isFree !== undefined) {
        lesson.isFree = isFree === 'true' || isFree === true
    }

    await lesson.save()

    res.json(lesson)
}

// ─────────────────────────────────────────────
// DELETE /api/lessons/:id  — Teacher only
// ─────────────────────────────────────────────
export const deleteLesson = async (req, res) => {
    const lesson = await Lesson.findById(req.params.id)
        .populate('course', 'teacher')

    if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found.' })
    }

    // Only course teacher can delete
    if (lesson.course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: 'Not authorized. You can only delete your own lessons.',
        })
    }

    // Delete video from Cloudinary if exists
    if (lesson.publicId) {
        await cloudinary.uploader.destroy(lesson.publicId, {
            resource_type: 'video',
        })
    }

    // Remove lesson from course lessons array
    await Course.findByIdAndUpdate(lesson.course._id, {
        $pull: { lessons: lesson._id },
        $inc: { totalDuration: -lesson.duration },
    })

    await lesson.deleteOne()

    res.json({ message: 'Lesson deleted successfully.' })
}

// ─────────────────────────────────────────────
// PATCH /api/lessons/reorder  — Teacher only
// Reorder lessons inside a course
// ─────────────────────────────────────────────
export const reorderLessons = async (req, res) => {
    const { lessons } = req.body

    // lessons = [{ _id: 'lessonId', order: 1 }, ...]
    if (!lessons || !Array.isArray(lessons)) {
        return res.status(400).json({
            message: 'Please provide lessons array with _id and order.',
        })
    }

    // Update each lesson order
    const updates = lessons.map(({ _id, order }) =>
        Lesson.findByIdAndUpdate(_id, { order }, { new: true })
    )

    await Promise.all(updates)

    res.json({ message: 'Lessons reordered successfully.' })
}