import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/axiosInstance'

const MyCourses = () => {
    const navigate = useNavigate()

    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    // ── Fetch enrollments ─────────────────────────────────────────
    useEffect(() => {
        api.get('/enrollments/my')
            .then(r => {
                setEnrollments(r.data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    // ── Filter courses ────────────────────────────────────────────
    const filtered = enrollments.filter(e => {
        if (filter === 'completed') return e.progress === 100
        if (filter === 'in-progress')
            return e.progress > 0 && e.progress < 100
        if (filter === 'not-started') return e.progress === 0
        return true
    })

    const getButtonLabel = (progress) => {
        if (progress === 100) return 'Review Course'
        if (progress > 0) return 'Continue →'
        return 'Start Learning →'
    }

    const getButtonStyle = (progress) => {
        if (progress === 100) {
            return 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100'
        }
        return 'bg-indigo-700 text-white hover:bg-indigo-600 shadow-md'
    }

    // ── Loading skeleton ──────────────────────────────────────────
    if (loading) {
        return (
            <div className='max-w-6xl mx-auto px-6 py-10'>
                <div className='grid grid-cols-1 md:grid-cols-2
                        lg:grid-cols-3 gap-5'>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i}
                            className='bg-white rounded-2xl border
                            border-indigo-100 overflow-hidden
                            animate-pulse'>
                            <div className='bg-indigo-100 h-44' />
                            <div className='p-4 space-y-3'>
                                <div className='bg-indigo-100 h-4 rounded w-3/4' />
                                <div className='bg-indigo-100 h-3 rounded w-1/2' />
                                <div className='bg-indigo-100 h-2 rounded' />
                                <div className='bg-indigo-100 h-9 rounded-xl' />
                            </div>
                        </div>
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
                        My Learning
                    </p>
                    <h1 className='text-3xl font-extrabold text-indigo-900
                         tracking-tight'>
                        My Courses
                    </h1>
                    <p className='text-indigo-400 text-sm mt-1'>
                        {enrollments.length} course
                        {enrollments.length !== 1 ? 's' : ''} enrolled
                    </p>
                </div>
                <Link
                    to='/courses'
                    className='bg-indigo-700 text-white px-6 py-3
                     rounded-xl font-bold text-sm
                     hover:bg-indigo-600 shadow-lg
                     shadow-indigo-200 transition-all w-fit'
                >
                    Find More Courses →
                </Link>
            </div>

            {/* ── Filter tabs ───────────────────────────────────────── */}
            <div className='flex gap-2 mb-8 flex-wrap'>
                {[
                    { key: 'all', label: `All (${enrollments.length})` },
                    { key: 'in-progress', label: `In Progress (${enrollments.filter(e => e.progress > 0 && e.progress < 100).length})` },
                    { key: 'completed', label: `Completed (${enrollments.filter(e => e.progress === 100).length})` },
                    { key: 'not-started', label: `Not Started (${enrollments.filter(e => e.progress === 0).length})` },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold
                        border transition-all
                        ${filter === tab.key
                                ? 'bg-indigo-700 text-white border-indigo-700'
                                : 'bg-white text-indigo-500 border-indigo-200 hover:border-indigo-400'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Empty state ───────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className='text-center py-20 bg-white rounded-2xl
                        border border-indigo-100'>
                    <div className='text-5xl mb-4'>
                        {filter === 'completed' ? '🏆'
                            : filter === 'in-progress' ? '⏳'
                                : '📚'}
                    </div>
                    <h3 className='font-extrabold text-indigo-900 mb-2'>
                        {filter === 'all'
                            ? 'No courses enrolled yet'
                            : `No ${filter.replace('-', ' ')} courses`
                        }
                    </h3>
                    <p className='text-indigo-400 text-sm mb-6'>
                        {filter === 'all'
                            ? 'Browse and enroll in courses to start learning'
                            : 'Change the filter to see other courses'
                        }
                    </p>
                    {filter === 'all' && (
                        <Link
                            to='/courses'
                            className='bg-indigo-700 text-white px-6 py-2.5
                         rounded-xl font-bold text-sm
                         hover:bg-indigo-600'
                        >
                            Browse Courses
                        </Link>
                    )}
                </div>
            ) : (
                /* ── Course grid ────────────────────────────────────── */
                <div className='grid grid-cols-1 md:grid-cols-2
                        lg:grid-cols-3 gap-5'>
                    {filtered.map(({
                        course,
                        progress,
                        completedLessons,
                        enrolledAt,
                        completedAt,
                    }) => (
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
                                        `https://via.placeholder.com/400x180?text=${encodeURIComponent(course.title)}`
                                    }
                                    alt={course.title}
                                    className='w-full h-44 object-cover
                             group-hover:scale-105
                             transition-transform duration-300'
                                />

                                {/* Progress bar overlay */}
                                <div className='absolute bottom-0 left-0
                                right-0 h-1.5 bg-black/30'>
                                    <div
                                        className={`h-full transition-all duration-500
                      ${progress === 100
                                                ? 'bg-emerald-500'
                                                : 'bg-indigo-500'
                                            }`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                {/* Category badge */}
                                <span className='absolute top-3 left-3
                                 bg-white/90 text-indigo-700
                                 text-xs font-bold px-2.5 py-1
                                 rounded-lg border border-indigo-100'>
                                    {course.category}
                                </span>

                                {/* Completed badge */}
                                {progress === 100 && (
                                    <span className='absolute top-3 right-3
                                   bg-emerald-500 text-white
                                   text-xs font-bold px-2.5 py-1
                                   rounded-lg'>
                                        ✓ Completed
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className='p-5'>
                                <h3 className='font-bold text-indigo-900 text-sm
                                line-clamp-2 mb-1 leading-snug'>
                                    {course.title}
                                </h3>
                                <p className='text-xs text-indigo-400 mb-4'>
                                    by {course.teacher?.name}
                                </p>

                                {/* Progress section */}
                                <div className='mb-4'>
                                    <div className='flex items-center
                                  justify-between mb-1.5'>
                                        <span className='text-xs text-indigo-500'>
                                            {completedLessons?.length || 0} of{' '}
                                            {course.lessons?.length || 0} lessons
                                        </span>
                                        <span className='text-xs font-extrabold
                                     text-indigo-700'>
                                            {progress}%
                                        </span>
                                    </div>
                                    <div className='h-2 bg-indigo-100 rounded-full
                                  overflow-hidden'>
                                        <div
                                            className={`h-full rounded-full
                                  transition-all duration-500
                                  ${progress === 100
                                                    ? 'bg-emerald-500'
                                                    : 'bg-indigo-600'
                                                }`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className='flex items-center justify-between
                                text-xs text-indigo-400 mb-4'>
                                    <span>
                                        Enrolled:{' '}
                                        {new Date(enrolledAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short',
                                        })}
                                    </span>
                                    {completedAt && (
                                        <span className='text-emerald-600 font-semibold'>
                                            Done:{' '}
                                            {new Date(completedAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short',
                                            })}
                                        </span>
                                    )}
                                </div>

                                {/* Action button */}
                                <button
                                    onClick={() => navigate(`/courses/${course._id}`)}
                                    className={`w-full py-2.5 rounded-xl text-sm
                              font-bold transition-all
                              ${getButtonStyle(progress)}`}
                                >
                                    {getButtonLabel(progress)}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyCourses