import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        completedLessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        completedAt: {
            type: Date,
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
)

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

export default mongoose.model('Enrollment', enrollmentSchema)