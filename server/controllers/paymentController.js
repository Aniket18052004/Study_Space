import Razorpay from 'razorpay'
import crypto from 'crypto'
import Payment from '../models/Payment.js'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import User from '../models/User.js'

// Initialize Razorpay instance only if credentials are available
let razorpay = null
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_xxxxxxxxxxxxxxxx') {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
}

// ─────────────────────────────────────────────
// POST /api/payments/create-order
// Step 1 of payment flow
// Creates a Razorpay order and returns it
// to the frontend to open the payment modal
// ─────────────────────────────────────────────
export const createOrder = async (req, res) => {
    const { courseId } = req.body

    if (!courseId) {
        return res.status(400).json({
            message: 'courseId is required.',
        })
    }

    // Find the course
    const course = await Course.findById(courseId)

    if (!course) {
        return res.status(404).json({
            message: 'Course not found.',
        })
    }

    if (!course.isPublished) {
        return res.status(400).json({
            message: 'This course is not available.',
        })
    }

    // Free course — should use enrollment route instead
    if (course.price === 0) {
        return res.status(400).json({
            message: 'This course is free. Use the free enrollment route.',
        })
    }

    // Check if student already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
    })

    if (alreadyEnrolled) {
        return res.status(400).json({
            message: 'You are already enrolled in this course.',
        })
    }

    // Calculate final amount
    // Razorpay uses paise — multiply rupees by 100
    const finalPrice = course.discountPrice > 0
        ? course.discountPrice
        : course.price

    const amount = finalPrice * 100

    // Create Razorpay order
    const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
            courseId: courseId.toString(),
            studentId: req.user._id.toString(),
            courseName: course.title,
        },
    })

    // Save payment record in DB with status 'created'
    await Payment.create({
        student: req.user._id,
        course: courseId,
        razorpayOrderId: order.id,
        amount,
        currency: 'INR',
        status: 'created',
    })

    // Send order details to frontend
    res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        courseName: course.title,
        courseImage: course.thumbnail,
        studentName: req.user.name,
        studentEmail: req.user.email,
    })
}

// ─────────────────────────────────────────────
// POST /api/payments/verify
// Step 2 of payment flow
// Called by frontend AFTER student pays
// Verifies signature and enrolls student
// ─────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId,
    } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
            message: 'Missing payment verification details.',
        })
    }

    // ── STEP 1: Verify HMAC-SHA256 signature ────────────────────
    // This proves the payment is genuine and from Razorpay
    // Never skip this step — it prevents fake payment confirmations
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex')

    if (expectedSig !== razorpay_signature) {
        // Mark payment as failed in DB
        await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { status: 'failed' }
        )

        return res.status(400).json({
            message: 'Payment verification failed. Invalid signature.',
        })
    }

    // ── STEP 2: Update payment record to 'paid' ─────────────────
    await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: 'paid',
        }
    )

    // ── STEP 3: Enroll student in course ────────────────────────
    const alreadyEnrolled = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
    })

    if (!alreadyEnrolled) {
        await Enrollment.create({
            student: req.user._id,
            course: courseId,
        })

        await Course.findByIdAndUpdate(courseId, {
            $push: { enrolledStudents: req.user._id },
        })

        await User.findByIdAndUpdate(req.user._id, {
            $push: { enrolledCourses: courseId },
        })
    }

    res.json({
        message: 'Payment successful! You are now enrolled.',
        courseId,
    })
}

// ─────────────────────────────────────────────
// GET /api/payments/my
// Get payment history for logged in student
// ─────────────────────────────────────────────
export const getMyPayments = async (req, res) => {
    const payments = await Payment.find({
        student: req.user._id,
        status: 'paid',
    })
        .populate('course', 'title thumbnail price discountPrice')
        .sort('-createdAt')

    res.json(payments)
}

// ─────────────────────────────────────────────
// GET /api/payments/teacher/revenue
// Teacher sees revenue from their courses
// ─────────────────────────────────────────────
export const getTeacherRevenue = async (req, res) => {
    // Get all courses by this teacher
    const courses = await Course.find({
        teacher: req.user._id,
    }).select('_id title')

    const courseIds = courses.map(c => c._id)

    // Get all paid payments for these courses
    const payments = await Payment.find({
        course: { $in: courseIds },
        status: 'paid',
    })
        .populate('course', 'title price')
        .populate('student', 'name email')
        .sort('-createdAt')

    // Calculate total revenue
    // Amount is stored in paise — divide by 100 for rupees
    const totalRevenue = payments.reduce(
        (sum, p) => sum + p.amount / 100,
        0
    )

    res.json({
        totalRevenue,
        totalSales: payments.length,
        payments,
    })
}