import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Image storage (thumbnails + avatars) ──────────────────────
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'studyspace/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, crop: 'limit' }],
    },
})

// ── Video storage (lesson videos) ─────────────────────────────
const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'studyspace/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'webm', 'avi'],
    },
})

// ── Export upload handlers ────────────────────────────────────

// For course thumbnails — max 5MB
export const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('thumbnail')

// For lesson videos — max 500MB
export const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 500 * 1024 * 1024 },
}).single('video')

// For user profile avatars — max 2MB
export const uploadAvatar = multer({
    storage: imageStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar')

// Export cloudinary instance for use in controllers
export { cloudinary }