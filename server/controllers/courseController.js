import Course from '../models/Course.js'
import User from '../models/User.js'
import { cloudinary } from '../middleware/upload.js'

// ─────────────────────────────────────────────
// GET /api/courses  — Public
// Supports search, filter, pagination
// ─────────────────────────────────────────────
export const getCourses = async (req, res) => {
    const {
        category,
        level,
        search,
        minPrice,
        maxPrice,
        page = 1,
        limit = 12,
    } = req.query

    // Build filter object
    const filter = { isPublished: true }

    if (category) filter.category = category
    if (level) filter.level = level

    if (search) {
        filter.$text = { $search: search }
    }

    if (minPrice || maxPrice) {
        filter.price = {}
        if (minPrice) filter.price.$gte = Number(minPrice)
        if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Course.countDocuments(filter)

    const courses = await Course.find(filter)
        .populate('teacher', 'name avatar')
        .sort(search ? { score: { $meta: 'textScore' } } : '-createdAt')
        .skip(skip)
        .limit(Number(limit))

    res.json({
        courses,
        total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
    })
}

// ─────────────────────────────────────────────
// GET /api/courses/:id  — Public
// ─────────────────────────────────────────────
export const getCourseById = async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('teacher', 'name avatar bio')
        .populate({
            path: 'lessons',
            select: 'title duration order isFree',
        })

    if (!course) {
        return res.status(404).json({ message: 'Course not found.' })
    }

    res.json(course)
}

// ─────────────────────────────────────────────
// GET /api/courses/teacher/my  — Teacher only
// ─────────────────────────────────────────────
export const getTeacherCourses = async (req, res) => {
    const courses = await Course.find({ teacher: req.user._id })
        .populate('lessons', 'title duration order')
        .sort('-createdAt')

    res.json(courses)
}

// ─────────────────────────────────────────────
// POST /api/courses  — Teacher only
// ─────────────────────────────────────────────
export const createCourse = async (req, res) => {
    const {
        title,
        description,
        category,
        level,
        language,
        price,
        discountPrice,
        tags,
    } = req.body

    if (!title || !description || !category || !level) {
        return res.status(400).json({
            message: 'Title, description, category and level are required.',
        })
    }

    const course = await Course.create({
        title,
        description,
        category,
        level,
        language: language || 'English',
        price: Number(price) || 0,
        discountPrice: Number(discountPrice) || 0,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        teacher: req.user._id,
        thumbnail: req.file?.path || '',
    })

    // Add course to teacher's createdCourses list
    await User.findByIdAndUpdate(req.user._id, {
        $push: { createdCourses: course._id },
    })

    res.status(201).json(course)
}

// ─────────────────────────────────────────────
// PUT /api/courses/:id  — Teacher only
// ─────────────────────────────────────────────
export const updateCourse = async (req, res) => {
    const course = await Course.findById(req.params.id)

    if (!course) {
        return res.status(404).json({ message: 'Course not found.' })
    }

    // Only the teacher who created it can update
    if (course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: 'Not authorized. You can only edit your own courses.',
        })
    }

    const updates = { ...req.body }

    // Convert price fields to numbers
    if (updates.price) updates.price = Number(updates.price)
    if (updates.discountPrice) updates.discountPrice = Number(updates.discountPrice)

    // Convert tags string to array
    if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(',').map(t => t.trim())
    }

    // If new thumbnail uploaded
    if (req.file) {
        updates.thumbnail = req.file.path
    }

    const updated = await Course.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    )

    res.json(updated)
}

// ─────────────────────────────────────────────
// PATCH /api/courses/:id/publish  — Teacher only
// ─────────────────────────────────────────────
export const publishCourse = async (req, res) => {
    const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id,
    })

    if (!course) {
        return res.status(404).json({
            message: 'Course not found or not authorized.',
        })
    }

    if (course.lessons.length === 0) {
        return res.status(400).json({
            message: 'Add at least one lesson before publishing.',
        })
    }

    course.isPublished = true
    await course.save()

    res.json({ message: 'Course published successfully!', course })
}

// ─────────────────────────────────────────────
// PATCH /api/courses/:id/unpublish  — Teacher only
// ─────────────────────────────────────────────
export const unpublishCourse = async (req, res) => {
    const course = await Course.findOneAndUpdate(
        { _id: req.params.id, teacher: req.user._id },
        { isPublished: false },
        { new: true }
    )

    if (!course) {
        return res.status(404).json({
            message: 'Course not found or not authorized.',
        })
    }

    res.json({ message: 'Course unpublished.', course })
}

// ─────────────────────────────────────────────
// DELETE /api/courses/:id  — Teacher only
// ─────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
    const course = await Course.findById(req.params.id)

    if (!course) {
        return res.status(404).json({ message: 'Course not found.' })
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: 'Not authorized. You can only delete your own courses.',
        })
    }

    // Remove course from teacher's list
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { createdCourses: course._id },
    })

    await course.deleteOne()

    res.json({ message: 'Course deleted successfully.' })
}