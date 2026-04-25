import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../utils/axiosInstance'

const EnrollButton = ({ course, onEnrollSuccess }) => {
    const { user } = useSelector(s => s.auth)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    // ── Load Razorpay script dynamically ─────────────────────────
    const loadRazorpay = () => {
        return new Promise((resolve, reject) => {
            // If already loaded — resolve immediately
            if (window.Razorpay) return resolve()

            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
        })
    }

    // ── Handle free course enrollment ─────────────────────────────
    const handleFreeEnroll = async () => {
        setLoading(true)
        try {
            await api.post(`/enrollments/${course._id}`)

            // Notify parent to refresh enrollment status
            if (onEnrollSuccess) onEnrollSuccess()

            // Navigate to first lesson
            const firstLesson = course.lessons?.[0]
            if (firstLesson) {
                navigate(`/learn/${course._id}/${firstLesson._id}`)
            }
        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Enrollment failed. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    // ── Handle paid course — Razorpay flow ────────────────────────
    const handlePaidEnroll = async () => {
        setLoading(true)
        try {
            // Step 1 — Create order on backend
            const { data: order } = await api.post(
                '/payments/create-order',
                { courseId: course._id }
            )

            // Step 2 — Load Razorpay script
            await loadRazorpay()

            // Step 3 — Open Razorpay modal
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'StudySpace',
                description: order.courseName,
                image: order.courseImage,
                order_id: order.orderId,
                prefill: {
                    name: order.studentName,
                    email: order.studentEmail,
                },
                theme: {
                    color: '#3730A3',
                },
                notes: {
                    courseId: course._id,
                },

                // Step 4 — On payment success
                handler: async (response) => {
                    try {
                        // Step 5 — Verify payment on backend
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: course._id,
                        })

                        // Notify parent to refresh
                        if (onEnrollSuccess) onEnrollSuccess()

                        // Navigate to first lesson
                        const firstLesson = course.lessons?.[0]
                        if (firstLesson) {
                            navigate(`/learn/${course._id}/${firstLesson._id}`)
                        } else {
                            navigate('/dashboard/student')
                        }
                    } catch (err) {
                        alert(
                            'Payment verification failed. ' +
                            'Please contact support with your payment ID: ' +
                            response.razorpay_payment_id
                        )
                        setLoading(false)
                    }
                },

                // Step 6 — On modal close without payment
                modal: {
                    ondismiss: () => {
                        setLoading(false)
                    },
                },
            }

            const rzp = new window.Razorpay(options)

            // Handle payment failure
            rzp.on('payment.failed', (response) => {
                alert(
                    'Payment failed: ' +
                    response.error.description
                )
                setLoading(false)
            })

            rzp.open()

        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Could not initiate payment. Please try again.'
            )
            setLoading(false)
        }
    }

    const handleClick = () => {
        // Redirect to login if not logged in
        if (!user) {
            navigate('/login')
            return
        }

        // Students only can enroll
        if (user.role === 'teacher') {
            alert('Teachers cannot enroll in courses.')
            return
        }

        // Free course or paid course
        if (course.price === 0) {
            handleFreeEnroll()
        } else {
            handlePaidEnroll()
        }
    }

    const finalPrice = course.discountPrice > 0
        ? course.discountPrice
        : course.price

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className='w-full bg-indigo-700 text-white py-3.5
                 rounded-xl font-bold text-sm
                 hover:bg-indigo-600 disabled:opacity-60
                 disabled:cursor-not-allowed
                 shadow-lg shadow-indigo-200
                 transition-all'
        >
            {loading ? (
                <span className='flex items-center justify-center gap-2'>
                    <span className='w-4 h-4 border-2 border-white
                           border-t-transparent rounded-full
                           animate-spin' />
                    Processing...
                </span>
            ) : course.price === 0 ? (
                'Enroll for Free →'
            ) : (
                `Enroll Now — ₹${finalPrice} →`
            )}
        </button>
    )
}

export default EnrollButton