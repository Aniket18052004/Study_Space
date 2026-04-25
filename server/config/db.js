import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from server folder
dotenv.config({ path: path.join(__dirname, '../.env') })

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

        if (!mongoUri) {
            throw new Error('MONGODB_URI or MONGO_URI is not defined in .env file')
        }

        const conn = await mongoose.connect(mongoUri)
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB
