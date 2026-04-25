import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            default: '',
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: String,
            enum: ['Math', 'Physics', 'Biology', 'Chemistry', 'CS', 'English', 'Other'],
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
        },
        language: {
            type: String,
            default: 'English',
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
        },
        discountPrice: {
            type: Number,
            default: 0,
        },
        lessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
        enrolledStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        isPublished: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        totalDuration: {
            type: Number,
            default: 0,
        },
        tags: [String],
    },
    { timestamps: true }
)

// Text index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' })

export default mongoose.model('Course', courseSchema)