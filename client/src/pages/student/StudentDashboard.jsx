import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../utils/axiosInstance'

const StudentDashboard = () => {
    const { user } = useSelector(s => s.auth)
    const navigate = useNavigate()

    const [enrollments, setEnrollments] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    // ── Fetch student data ────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [enrollRes, paymentRes] = await Promise.all([
                    api.get('/enrollments/my'),
                    api.get('/payments/my'),
                ])
                setEnrollments(enrollRes.data)
                setPayments(paymentRes.data)
            } catch (err) {
                console.error('Failed to fetch student data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // ── Stats ─────────────────────────────────────────────────────
    const totalEnrolled = enrollments.length
    const completed = enrollments.filter(e => e.progress === 100).length
    const inProgress = enrollments.filter(
        e => e.progress > 0 && e.progress < 100
    ).length
    const avgProgress = totalEnrolled > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled
        )
        : 0

    // Recent — last 3 accessed
    const recentCourses = [...enrollments]
        .sort((a, b) =>
            new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt)
        )
        .slice(0, 3)

    const formatDuration = (seconds) => {
        if (!seconds) return '0m'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    // ── Loading skeleton ──────────────────────────────────────────
    if (loading) {
        return (
            <div className='max-w-6xl mx-auto px-6 py-10'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-5 mb-8'>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i}
                            className='bg-white rounded-2xl border
                            border-indigo-100 p-5 animate-pulse'>
                            <div className='bg-indigo-100 h-8 rounded w-1/2 mb-2' />
                            <div className='bg-indigo-100 h-3 rounded w-3/4' />
                        </div>
                    ))}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                    {[1, 2, 3].map(i => (
                        <div key={i}
                            className='bg-white rounded-2xl border
                            border-indigo-100 p-5 animate-pulse h-40' />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='max-w-6xl mx-auto px-6 py-10'>

            {/* ── Header ───────────────────────────────────────────── */}
            <div className='flex flex-col md:flex-row md:items-center
                      justify-between gap-4 mb-8'>
                <div>
                    <p className='text-xs font-bold text-emerald-600
                        uppercase tracking-widest mb-1'>
                        Student Dashboard
                    </p>
                    <h1 className='text-3xl font-extrabold text-indigo-900
                         tracking-tight'>
                        Welcome back, {user?.name}!
                    </h1>
                    <p className='text-indigo-400 text-sm mt-1'>
                        Track your progress and continue learning
                    </p>
                </div>
                <Link
                    to='/courses'
                    className='bg-indigo-700 text-white px-6 py-3
                     rounded-xl font-bold text-sm
                     hover:bg-indigo-600 shadow-lg
                     shadow-indigo-200 transition-all
                     flex items-center gap-2 w-fit'
                >
                    Browse Courses →
                </Link>
            </div>

            {/* ── Stats cards ──────────────────────────────────────── */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-5 mb-10'>
                {[
                    {
                        label: 'Enrolled',
                        value: totalEnrolled,
                        icon: '📚',
                        color: 'bg-indigo-50 border-indigo-200',
                        textColor: 'text-indigo-700',
                    },
                    {
                        label: 'In Progress',
                        value: inProgress,
                        icon: '⏳',
                        color: 'bg-amber-50 border-amber-200',
                        textColor: 'text-amber-700',
                    },
                    {
                        label: 'Completed',
                        value: completed,
                        icon: '🏆',
                        color: 'bg-emerald-50 border-emerald-200',
                        textColor: 'text-emerald-700',
                    },
                    {
                        label: 'Avg Progress',
                        value: `${avgProgress}%`,
                        icon: '📊',
                        color: 'bg-purple-50 border-purple-200',
                        textColor: 'text-purple-700',
                    },
                ].map(({ label, value, icon, color, textColor }) => (
                    <div key={label}
                        className={`rounded-2xl border p-5 ${color}`}>
                        <div className='text-2xl mb-2'>{icon}</div>
                        <div className={`text-2xl font-extrabold
                             tracking-tight ${textColor}`}>
                            {value}
                        </div>
                        <div className='text-xs font-semibold
                            text-indigo-400 mt-1'>
                            {label}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Overall progress bar ──────────────────────────────── */}
            {totalEnrolled > 0 && (
                <div className='bg-white rounded-2xl border border-indigo-100
                        p-6 mb-8'>
                    <div className='flex items-center justify-between mb-3'>
                        <h2 className='font-extrabold text-indigo-900 text-sm'>
                            Overall Learning Progress
                        </h2>
                        <span className='text-sm font-extrabold text-indigo-600'>
                            {avgProgress}%
                        </span>
                    </div>
                    <div className='h-3 bg-indigo-100 rounded-full overflow-hidden'>
                        <div
                            className='h-full bg-gradient-to-r from-indigo-600
                         to-purple-500 rounded-full transition-all
                         duration-700'
                            style={{ width: `${avgProgress}%` }}
                        />
                    </div>
                    <div className='flex justify-between text-xs
                          text-indigo-400 mt-2'>
                        <span>{completed} of {totalEnrolled} courses completed</span>
                        <span>{inProgress} in progress</span>
                    </div>
                </div>
            )}

            {/* ── Continue learning ─────────────────────────────────── */}
            <div className='mb-10'>
                <div className='flex items-center justify-between mb-5'>
                    <h2 className='text-xl font-extrabold text-indigo-900'>
                        Continue Learning
                    </h2>
                    <Link
                        to='/my-courses'
                        className='text-sm font-bold text-indigo-600
                       hover:underline'
                    >
                        View all →
                    </Link>
                </div>

                {recentCourses.length === 0 ? (
                    <div className='text-center py-14 bg-white rounded-2xl
                          border border-indigo-100'>
                        <div className='text-5xl mb-4'>🎓</div>
                        <h3 className='font-extrabold text-indigo-900 mb-2'>
                            No courses yet
                        </h3>
                        <p className='text-indigo-400 text-sm mb-6'>
                            Enroll in a course to start your learning journey
                        </p>
                        <Link
                            to='/courses'
                            className='bg-indigo-700 text-white px-6 py-2.5
                         rounded-xl font-bold text-sm
                         hover:bg-indigo-600'
                        >
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                        {recentCourses.map(({ course, progress,
                            completedLessons }) => (
                            <div
                                key={course._id}
                                className='bg-white rounded-2xl border
                           border-indigo-100 overflow-hidden
                           hover:shadow-lg transition-all group'
                            >
                                {/* Thumbnail */}
                                <div className='relative overflow-hidden'>
                                    <img
                                        src={
                                            course.thumbnail ||
                                            `https://via.placeholder.com/400x160?text=${encodeURIComponent(course.title)}`
                                        }
                                        alt={course.title}
                                        className='w-full h-36 object-cover
                               group-hover:scale-105
                               transition-transform duration-300'
                                    />
                                    {/* Progress overlay */}
                                    <div className='absolute bottom-0 left-0
                                  right-0 h-1.5 bg-black/20'>
                                        <div
                                            className='h-full bg-indigo-500
                                 transition-all duration-500'
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    {/* Completed badge */}
                                    {progress === 100 && (
                                        <div className='absolute top-3 right-3
                                    bg-emerald-500 text-white
                                    text-xs font-bold px-2 py-1
                                    rounded-lg'>
                                            ✓ Done
                                        </div>
                                    )}
                                </div>

                                <div className='p-4'>
                                    <h3 className='font-bold text-indigo-900 text-sm
                                  line-clamp-2 mb-1 leading-snug'>
                                        {course.title}
                                    </h3>
                                    <p className='text-xs text-indigo-400 mb-3'>
                                        by {course.teacher?.name}
                                    </p>

                                    {/* Progress info */}
                                    <div className='flex items-center justify-between
                                  text-xs text-indigo-500 mb-3'>
                                        <span>
                                            {completedLessons?.length || 0} of{' '}
                                            {course.lessons?.length || 0} lessons
                                        </span>
                                        <span className='font-bold text-indigo-700'>
                                            {progress}%
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className='h-1.5 bg-indigo-100 rounded-full
                                  overflow-hidden mb-4'>
                                        <div
                                            className='h-full bg-indigo-600 rounded-full
                                 transition-all duration-500'
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    {/* Continue button */}
                                    <Link
                                        to={`/courses/${course._id}`}
                                        className='block w-full text-center
                               bg-indigo-700 text-white py-2
                               rounded-xl text-xs font-bold
                               hover:bg-indigo-600 transition-all'
                                    >
                                        {progress === 100
                                            ? 'Review Course'
                                            : progress > 0
                                                ? 'Continue →'
                                                : 'Start Learning →'
                                        }
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Payment history ───────────────────────────────────── */}
            {payments.length > 0 && (
                <div>
                    <h2 className='text-xl font-extrabold text-indigo-900 mb-5'>
                        Payment History
                    </h2>
                    <div className='bg-white rounded-2xl border
                          border-indigo-100 overflow-hidden'>
                        <div className='divide-y divide-indigo-50'>
                            {payments.map(payment => (
                                <div key={payment._id}
                                    className='flex items-center gap-4 p-4'>
                                    {/* Course thumbnail */}
                                    <img
                                        src={
                                            payment.course?.thumbnail ||
                                            `https://via.placeholder.com/48?text=C`
                                        }
                                        alt=''
                                        className='w-12 h-10 object-cover rounded-xl
                               flex-shrink-0'
                                    />

                                    {/* Course info */}
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-bold text-indigo-900
                                   line-clamp-1'>
                                            {payment.course?.title}
                                        </p>
                                        <p className='text-xs text-indigo-400 mt-0.5'>
                                            {new Date(payment.createdAt)
                                                .toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })
                                            }
                                        </p>
                                    </div>

                                    {/* Amount + status */}
                                    <div className='text-right flex-shrink-0'>
                                        <p className='text-sm font-extrabold text-indigo-900'>
                                            ₹{(payment.amount / 100)
                                                .toLocaleString('en-IN')}
                                        </p>
                                        <span className='text-xs font-bold text-emerald-600
                                     bg-emerald-50 border border-emerald-200
                                     px-2 py-0.5 rounded-full'>
                                            Paid
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default StudentDashboard