import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../utils/axiosInstance'

const TeacherDashboard = () => {
    const { user } = useSelector(s => s.auth)
    const navigate = useNavigate()

    const [courses, setCourses] = useState([])
    const [revenue, setRevenue] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('courses')
    const [deleting, setDeleting] = useState(null)

    // ── Fetch teacher data ────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [coursesRes, revenueRes] = await Promise.all([
                    api.get('/courses/teacher/my'),
                    api.get('/payments/teacher/revenue'),
                ])
                setCourses(coursesRes.data)
                setRevenue(revenueRes.data)
            } catch (err) {
                console.error('Failed to fetch teacher data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // ── Publish course ────────────────────────────────────────────
    const handlePublish = async (courseId) => {
        try {
            await api.patch(`/courses/${courseId}/publish`)
            setCourses(prev =>
                prev.map(c =>
                    c._id === courseId ? { ...c, isPublished: true } : c
                )
            )
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to publish course.')
        }
    }

    // ── Unpublish course ──────────────────────────────────────────
    const handleUnpublish = async (courseId) => {
        try {
            await api.patch(`/courses/${courseId}/unpublish`)
            setCourses(prev =>
                prev.map(c =>
                    c._id === courseId ? { ...c, isPublished: false } : c
                )
            )
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to unpublish.')
        }
    }

    // ── Delete course ─────────────────────────────────────────────
    const handleDelete = async (courseId) => {
        if (!window.confirm(
            'Are you sure you want to delete this course? ' +
            'This cannot be undone.'
        )) return

        setDeleting(courseId)
        try {
            await api.delete(`/courses/${courseId}`)
            setCourses(prev => prev.filter(c => c._id !== courseId))
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete course.')
        } finally {
            setDeleting(null)
        }
    }

    // ── Stats calculations ────────────────────────────────────────
    const totalStudents = courses.reduce(
        (sum, c) => sum + (c.enrolledStudents?.length || 0), 0
    )
    const publishedCount = courses.filter(c => c.isPublished).length
    const draftCount = courses.filter(c => !c.isPublished).length

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
                            className='bg-white rounded-2xl border border-indigo-100
                            p-5 animate-pulse'>
                            <div className='bg-indigo-100 h-8 rounded w-1/2 mb-2' />
                            <div className='bg-indigo-100 h-3 rounded w-3/4' />
                        </div>
                    ))}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i}
                            className='bg-white rounded-2xl border border-indigo-100
                            p-5 animate-pulse h-36' />
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
                        Teacher Dashboard
                    </p>
                    <h1 className='text-3xl font-extrabold text-indigo-900
                         tracking-tight'>
                        Welcome, {user?.name}!
                    </h1>
                    <p className='text-indigo-400 text-sm mt-1'>
                        Manage your courses, track students and monitor revenue
                    </p>
                </div>
                <Link
                    to='/dashboard/courses/new'
                    className='bg-indigo-700 text-white px-6 py-3
                     rounded-xl font-bold text-sm
                     hover:bg-indigo-600 shadow-lg
                     shadow-indigo-200 transition-all
                     flex items-center gap-2 w-fit'
                >
                    <span className='text-lg'>+</span>
                    Create New Course
                </Link>
            </div>

            {/* ── Stats cards ──────────────────────────────────────── */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-5 mb-8'>
                {[
                    {
                        label: 'Total Courses',
                        value: courses.length,
                        icon: '📚',
                        color: 'bg-indigo-50 border-indigo-200',
                        textColor: 'text-indigo-700',
                    },
                    {
                        label: 'Total Students',
                        value: totalStudents,
                        icon: '🎓',
                        color: 'bg-emerald-50 border-emerald-200',
                        textColor: 'text-emerald-700',
                    },
                    {
                        label: 'Published',
                        value: publishedCount,
                        icon: '✅',
                        color: 'bg-green-50 border-green-200',
                        textColor: 'text-green-700',
                    },
                    {
                        label: 'Total Revenue',
                        value: revenue
                            ? `₹${revenue.totalRevenue.toLocaleString('en-IN')}`
                            : '₹0',
                        icon: '💰',
                        color: 'bg-amber-50 border-amber-200',
                        textColor: 'text-amber-700',
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

            {/* ── Tabs ─────────────────────────────────────────────── */}
            <div className='flex gap-1 mb-6 border-b border-indigo-100'>
                {[
                    { key: 'courses', label: `All Courses (${courses.length})` },
                    { key: 'published', label: `Published (${publishedCount})` },
                    { key: 'drafts', label: `Drafts (${draftCount})` },
                    { key: 'revenue', label: 'Revenue' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2.5 text-sm font-bold
                        transition-all border-b-2 -mb-px
                        ${activeTab === tab.key
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-indigo-400 hover:text-indigo-600'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Course list ───────────────────────────────────────── */}
            {activeTab !== 'revenue' && (
                <>
                    {/* Filter courses based on tab */}
                    {(() => {
                        const filtered = activeTab === 'published'
                            ? courses.filter(c => c.isPublished)
                            : activeTab === 'drafts'
                                ? courses.filter(c => !c.isPublished)
                                : courses

                        if (filtered.length === 0) {
                            return (
                                <div className='text-center py-16'>
                                    <div className='text-5xl mb-4'>
                                        {activeTab === 'drafts' ? '📝' : '📚'}
                                    </div>
                                    <h3 className='text-lg font-extrabold
                                 text-indigo-900 mb-2'>
                                        {activeTab === 'drafts'
                                            ? 'No draft courses'
                                            : 'No courses yet'
                                        }
                                    </h3>
                                    <p className='text-indigo-400 text-sm mb-6'>
                                        {activeTab === 'drafts'
                                            ? 'All your courses are published!'
                                            : 'Create your first course to get started.'
                                        }
                                    </p>
                                    <Link
                                        to='/dashboard/courses/new'
                                        className='bg-indigo-700 text-white px-6 py-2.5
                               rounded-xl font-bold text-sm
                               hover:bg-indigo-600'
                                    >
                                        Create Course
                                    </Link>
                                </div>
                            )
                        }

                        return (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                {filtered.map(course => (
                                    <div
                                        key={course._id}
                                        className='bg-white rounded-2xl border
                               border-indigo-100 p-5
                               hover:shadow-lg transition-all'
                                    >
                                        <div className='flex gap-4'>
                                            {/* Thumbnail */}
                                            <img
                                                src={
                                                    course.thumbnail ||
                                                    `https://via.placeholder.com/80x60?text=${encodeURIComponent(course.category)}`
                                                }
                                                alt={course.title}
                                                className='w-20 h-16 object-cover
                                   rounded-xl flex-shrink-0'
                                            />

                                            {/* Course info */}
                                            <div className='flex-1 min-w-0'>
                                                <h3 className='font-bold text-indigo-900
                                       text-sm line-clamp-1 mb-1'>
                                                    {course.title}
                                                </h3>
                                                <div className='flex flex-wrap items-center
                                        gap-2 text-xs text-indigo-400'>
                                                    <span>
                                                        {course.lessons?.length || 0} lessons
                                                    </span>
                                                    <span>·</span>
                                                    <span>
                                                        {course.enrolledStudents?.length || 0} students
                                                    </span>
                                                    <span>·</span>
                                                    <span>
                                                        {formatDuration(course.totalDuration)}
                                                    </span>
                                                </div>

                                                {/* Status + price row */}
                                                <div className='flex items-center
                                        gap-2 mt-2 flex-wrap'>
                                                    <span className={`text-xs font-bold px-2
                                           py-0.5 rounded-full border
                                           ${course.isPublished
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {course.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                    <span className='text-xs font-bold
                                           text-indigo-700'>
                                                        {course.price === 0
                                                            ? 'Free'
                                                            : `₹${course.discountPrice || course.price}`
                                                        }
                                                    </span>
                                                    <span className='text-xs text-indigo-400
                                           capitalize'>
                                                        {course.level}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className='flex gap-2 mt-4 pt-4
                                    border-t border-indigo-50
                                    flex-wrap'>
                                            {/* View course */}
                                            <Link
                                                to={`/courses/${course._id}`}
                                                className='flex-1 text-center bg-indigo-50
                                   text-indigo-700 border border-indigo-200
                                   text-xs font-bold py-2 rounded-xl
                                   hover:bg-indigo-100 transition-all'
                                            >
                                                View
                                            </Link>

                                            {/* Publish / Unpublish */}
                                            {course.isPublished ? (
                                                <button
                                                    onClick={() => handleUnpublish(course._id)}
                                                    className='flex-1 bg-amber-50 text-amber-700
                                     border border-amber-200 text-xs
                                     font-bold py-2 rounded-xl
                                     hover:bg-amber-100 transition-all'
                                                >
                                                    Unpublish
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePublish(course._id)}
                                                    className='flex-1 bg-emerald-50 text-emerald-700
                                     border border-emerald-200 text-xs
                                     font-bold py-2 rounded-xl
                                     hover:bg-emerald-100 transition-all'
                                                >
                                                    Publish
                                                </button>
                                            )}

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                disabled={deleting === course._id}
                                                className='flex-1 bg-red-50 text-red-600
                                   border border-red-200 text-xs
                                   font-bold py-2 rounded-xl
                                   hover:bg-red-100 transition-all
                                   disabled:opacity-60'
                                            >
                                                {deleting === course._id
                                                    ? 'Deleting...'
                                                    : 'Delete'
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </>
            )}

            {/* ── Revenue tab ───────────────────────────────────────── */}
            {activeTab === 'revenue' && revenue && (
                <div>
                    {/* Revenue stats */}
                    <div className='grid grid-cols-2 gap-5 mb-6'>
                        <div className='bg-white rounded-2xl border
                            border-indigo-100 p-6 text-center'>
                            <div className='text-3xl font-extrabold text-amber-600
                              mb-1'>
                                ₹{revenue.totalRevenue.toLocaleString('en-IN')}
                            </div>
                            <div className='text-sm text-indigo-400 font-semibold'>
                                Total Revenue Earned
                            </div>
                        </div>
                        <div className='bg-white rounded-2xl border
                            border-indigo-100 p-6 text-center'>
                            <div className='text-3xl font-extrabold text-indigo-700
                              mb-1'>
                                {revenue.totalSales}
                            </div>
                            <div className='text-sm text-indigo-400 font-semibold'>
                                Total Course Sales
                            </div>
                        </div>
                    </div>

                    {/* Payment history */}
                    {revenue.payments?.length > 0 ? (
                        <div className='bg-white rounded-2xl border
                            border-indigo-100 overflow-hidden'>
                            <div className='p-5 border-b border-indigo-100'>
                                <h3 className='font-extrabold text-indigo-900'>
                                    Recent Payments
                                </h3>
                            </div>
                            <div className='divide-y divide-indigo-50'>
                                {revenue.payments.map(payment => (
                                    <div key={payment._id}
                                        className='flex items-center gap-4 p-4'>
                                        {/* Student avatar */}
                                        <img
                                            src={
                                                payment.student?.avatar ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    payment.student?.name || 'S'
                                                )}&background=3730A3&color=fff`
                                            }
                                            alt=''
                                            className='w-9 h-9 rounded-full object-cover
                                 border-2 border-indigo-100
                                 flex-shrink-0'
                                        />

                                        {/* Info */}
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-bold text-indigo-900
                                    line-clamp-1'>
                                                {payment.student?.name}
                                            </p>
                                            <p className='text-xs text-indigo-400
                                    line-clamp-1'>
                                                {payment.course?.title}
                                            </p>
                                        </div>

                                        {/* Amount */}
                                        <div className='text-right flex-shrink-0'>
                                            <p className='text-sm font-extrabold
                                    text-emerald-600'>
                                                ₹{(payment.amount / 100).toLocaleString('en-IN')}
                                            </p>
                                            <p className='text-xs text-indigo-400'>
                                                {new Date(payment.createdAt)
                                                    .toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className='text-center py-12 text-indigo-400'>
                            <div className='text-4xl mb-3'>💰</div>
                            <p className='font-semibold'>No payments yet</p>
                            <p className='text-sm mt-1'>
                                Publish a paid course to start earning
                            </p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}

export default TeacherDashboard;