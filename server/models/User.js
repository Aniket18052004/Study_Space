import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['student', 'teacher', 'admin'],
            default: 'student',
        },
        avatar: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            default: '',
        },
        googleId: {
            type: String,
        },
        authMethod: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
        createdCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
    },
    { timestamps: true }
)

// Auto-hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

// Compare entered password with hashed password
userSchema.methods.matchPassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)