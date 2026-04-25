import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        videoUrl: {
            type: String,
            default: '',
        },
        publicId: {
            type: String,
            default: '',
        },
        duration: {
            type: Number,
            default: 0,
        },
        order: {
            type: Number,
            required: true,
        },
        isFree: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            default: '',
        },
        resources: [
            {
                title: String,
                url: String,
            },
        ],
    },
    { timestamps: true }
)

export default mongoose.model('Lesson', lessonSchema)