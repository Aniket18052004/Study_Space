import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'
import User from '../models/User.js'

// ─────────────────────────────────────────────
// POST /api/enrollments/:courseId
// Enroll in a FREE course only
// Paid courses are enrolled via payment flow
// ─────────────────────────────────────────────
export const enrollFree = async (req, res) => {
    const { courseId } = req.params

    // Find the course
    const course = await Course.findById(courseId)

    if (!course) {
        return res.status(404).json({
            message: 'Course not found.',
        })
    }

    if (!course.isPublished) {
        return res.status(400).json({
            message: 'This course is not available yet.',
        })
    }

    // Block paid courses from this route
    if (course.price > 0) {
        return res.status(400).json({
            message: 'This is a paid course. Please complete payment to enroll.',
        })
    }

    // Check if student is already enrolled
    const existing = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
    })

    if (existing) {
        return res.status(400).json({
            message: 'You are already enrolled in this course.',
        })
    }

    // Create enrollment record
    const enrollment = await Enrollment.create({
        student: req.user._id,
        course: courseId,
    })

    // Add student to course enrolledStudents array
    await Course.findByIdAndUpdate(courseId, {
        $push: { enrolledStudents: req.user._id },
    })

    // Add course to student enrolledCourses array
    await User.findByIdAndUpdate(req.user._id, {
        $push: { enrolledCourses: courseId },
    })

    res.status(201).json({
        message: 'Successfully enrolled! Start learning now.',
        enrollment,
    })
}

// ─────────────────────────────────────────────
// GET /api/enrollments/my
// Get all enrollments for logged in student
// ─────────────────────────────────────────────
export const getMyEnrollments = async (req, res) => {
    const enrollments = await Enrollment.find({
        student: req.user._id,
    })
        .populate({
            path: 'course',
            populate: {
                path: 'teacher',
                select: 'name avatar',
            },
        })
        .sort('-createdAt')

    res.json(enrollments)
}

// ─────────────────────────────────────────────
// GET /api/enrollments/:courseId/check
// Check if current user is enrolled in a course
// ─────────────────────────────────────────────
export const checkEnrollment = async (req, res) => {
    const { courseId } = req.params

    const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
    })

    res.json({
        isEnrolled: !!enrollment,
        progress: enrollment?.progress || 0,
        completedLessons: enrollment?.completedLessons || [],
        completedAt: enrollment?.completedAt || null,
    })
}

// ─────────────────────────────────────────────
// PATCH /api/enrollments/:courseId/progress
// Mark a lesson as complete and update progress
// Body: { lessonId }
// ─────────────────────────────────────────────
export const markLessonComplete = async (req, res) => {
    const { courseId } = req.params
    const { lessonId } = req.body

    if (!lessonId) {
        return res.status(400).json({
            message: 'lessonId is required.',
        })
    }

    // Find enrollment and populate course for total lesson count
    const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
    }).populate('course', 'lessons')

    if (!enrollment) {
        return res.status(404).json({
            message: 'You are not enrolled in this course.',
        })
    }

    // Add lesson to completedLessons if not already there
    const alreadyCompleted = enrollment.completedLessons
        .map(id => id.toString())
        .includes(lessonId)

    if (!alreadyCompleted) {
        enrollment.completedLessons.push(lessonId)
    }

    // Calculate progress percentage
    const totalLessons = enrollment.course.lessons.length

    enrollment.progress = totalLessons > 0
        ? Math.round(
            (enrollment.completedLessons.length / totalLessons) * 100
        )
        : 0

    // Update last accessed time
    enrollment.lastAccessedAt = new Date()

    // Mark course as completed if 100%
    if (enrollment.progress === 100 && !enrollment.completedAt) {
        enrollment.completedAt = new Date()
    }

    await enrollment.save()

    res.json({
        message: alreadyCompleted ? 'Lesson already completed.' : 'Lesson marked as complete!',
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        completedAt: enrollment.completedAt,
        isCompleted: enrollment.progress === 100,
    })
}

// ─────────────────────────────────────────────
// PATCH /api/enrollments/:courseId/unmark
// Unmark a completed lesson
// Body: { lessonId }
// ─────────────────────────────────────────────
export const unmarkLessonComplete = async (req, res) => {
    const { courseId } = req.params
    const { lessonId } = req.body

    if (!lessonId) {
        return res.status(400).json({
            message: 'lessonId is required.',
        })
    }

    const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
    }).populate('course', 'lessons')

    if (!enrollment) {
        return res.status(404).json({
            message: 'Enrollment not found.',
        })
    }

    // Remove lesson from completedLessons
    enrollment.completedLessons = enrollment.completedLessons
        .filter(id => id.toString() !== lessonId)

    // Recalculate progress
    const totalLessons = enrollment.course.lessons.length

    enrollment.progress = totalLessons > 0
        ? Math.round(
            (enrollment.completedLessons.length / totalLessons) * 100
        )
        : 0

    // Reset completedAt if no longer 100%
    if (enrollment.progress < 100) {
        enrollment.completedAt = null
    }

    await enrollment.save()

    res.json({
        message: 'Lesson unmarked.',
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
    })
}

// ─────────────────────────────────────────────
// GET /api/enrollments/teacher/students
// Teacher sees all students in their courses
// ─────────────────────────────────────────────
export const getCourseStudents = async (req, res) => {
    const { courseId } = req.query

    if (!courseId) {
        return res.status(400).json({
            message: 'courseId query param is required.',
        })
    }

    // Verify course belongs to teacher
    const course = await Course.findOne({
        _id: courseId,
        teacher: req.user._id,
    })

    if (!course) {
        return res.status(403).json({
            message: 'Course not found or not authorized.',
        })
    }

    const enrollments = await Enrollment.find({ course: courseId })
        .populate('student', 'name email avatar createdAt')
        .sort('-createdAt')

    res.json({
        totalStudents: enrollments.length,
        enrollments,
    })
}