import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../utils/axiosInstance'
import EnrollButton from '../components/EnrollButton'

const CourseDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)

    const [course, setCourse] = useState(null)
    const [enrolled, setEnrolled] = useState(false)
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    // ── Fetch course data ─────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Always fetch course details
                const { data: courseData } = await api.get(`/courses/${id}`)
                setCourse(courseData)

                // Check enrollment status if logged in
                if (user) {
                    const { data: enrollData } = await api.get(
                        `/enrollments/${id}/check`
                    )
                    setEnrolled(enrollData.isEnrolled)
                    setProgress(enrollData.progress)
                }
            } catch (err) {
                console.error('Failed to fetch course:', err)
                if (err.response?.status === 404) {
                    navigate('/courses')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, user])

    // Called by EnrollButton after successful enrollment
    const handleEnrollSuccess = async () => {
        const { data } = await api.get(`/enrollments/${id}/check`)
        setEnrolled(data.isEnrolled)
        setProgress(data.progress)
    }

    const formatDuration = (seconds) => {
        if (!seconds) return '0m'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    // ── Loading skeleton ──────────────────────────────────────────
    if (loading) {
        return (
            <div className='max-w-6xl mx-auto px-6 py-10
                      grid grid-cols-1 lg:grid-cols-3 gap-10'>
                <div className='lg:col-span-2 space-y-4 animate-pulse'>
                    <div className='bg-indigo-100 h-8 rounded w-3/4' />
                    <div className='bg-indigo-100 h-4 rounded w-full' />
                    <div className='bg-indigo-100 h-4 rounded w-2/3' />
                    <div className='bg-indigo-100 h-48 rounded-2xl' />
                </div>
                <div className='animate-pulse'>
                    <div className='bg-white rounded-2xl border
                          border-indigo-100 p-6 space-y-4'>
                        <div className='bg-indigo-100 h-44 rounded-xl' />
                        <div className='bg-indigo-100 h-8 rounded w-1/3' />
                        <div className='bg-indigo-100 h-12 rounded-xl' />
                    </div>
                </div>
            </div>
        )
    }

    if (!course) return null

    const totalLessons = course.lessons?.length || 0
    const freeLessons = course.lessons?.filter(l => l.isFree).length || 0
    const totalDuration = formatDuration(course.totalDuration)

    return (
        <div className='max-w-6xl mx-auto px-6 py-10'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>

                {/* ── Left column ──────────────────────────────────── */}
                <div className='lg:col-span-2'>

                    {/* Breadcrumb */}
                    <div className='flex items-center gap-2 text-xs
                          text-indigo-400 mb-4'>
                        <Link to='/courses' className='hover:text-indigo-600'>
                            Courses
                        </Link>
                        <span>›</span>
                        <span>{course.category}</span>
                        <span>›</span>
                        <span className='text-indigo-600 font-semibold
                             line-clamp-1'>
                            {course.title}
                        </span>
                    </div>

                    {/* Category + level badges */}
                    <div className='flex gap-2 mb-3'>
                        <span className='text-xs font-bold text-indigo-600
                             bg-indigo-50 border border-indigo-200
                             px-3 py-1 rounded-full'>
                            {course.category}
                        </span>
                        <span className='text-xs font-bold text-purple-600
                             bg-purple-50 border border-purple-200
                             px-3 py-1 rounded-full'>
                            {course.level}
                        </span>
                        {course.language && (
                            <span className='text-xs font-bold text-slate-500
                               bg-slate-50 border border-slate-200
                               px-3 py-1 rounded-full'>
                                {course.language}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className='text-3xl font-extrabold text-indigo-900
                         tracking-tight leading-tight mb-4'>
                        {course.title}
                    </h1>

                    {/* Stats row */}
                    <div className='flex flex-wrap items-center gap-5
                          text-sm text-indigo-500 mb-6'>
                        {course.rating > 0 && (
                            <span className='flex items-center gap-1'>
                                <span className='text-amber-500 font-bold'>
                                    ★ {course.rating}
                                </span>
                                <span>({course.totalReviews} reviews)</span>
                            </span>
                        )}
                        <span>
                            {course.enrolledStudents?.length || 0} students enrolled
                        </span>
                        <span>{totalLessons} lessons</span>
                        <span>{totalDuration} total</span>
                    </div>

                    {/* Teacher info */}
                    <div className='flex items-center gap-3 mb-8
                          p-4 bg-white rounded-2xl
                          border border-indigo-100'>
                        <img
                            src={
                                course.teacher?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    course.teacher?.name || 'Teacher'
                                )}&background=3730A3&color=fff`
                            }
                            alt={course.teacher?.name}
                            className='w-12 h-12 rounded-full object-cover
                         border-2 border-indigo-200 flex-shrink-0'
                        />
                        <div>
                            <p className='text-xs text-indigo-400 mb-0.5'>
                                Created by
                            </p>
                            <p className='font-bold text-indigo-900 text-sm'>
                                {course.teacher?.name}
                            </p>
                            {course.teacher?.bio && (
                                <p className='text-xs text-indigo-400 mt-0.5
                              line-clamp-1'>
                                    {course.teacher.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className='flex gap-1 mb-6 border-b border-indigo-100'>
                        {['overview', 'lessons', 'tags'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 text-sm font-bold
                            capitalize transition-all border-b-2
                            -mb-px
                            ${activeTab === tab
                                        ? 'border-indigo-600 text-indigo-700'
                                        : 'border-transparent text-indigo-400 hover:text-indigo-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Overview tab */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 className='text-lg font-extrabold text-indigo-900
                             mb-3'>
                                About this course
                            </h2>
                            <p className='text-indigo-600 text-sm leading-relaxed
                            whitespace-pre-wrap mb-6'>
                                {course.description}
                            </p>

                            {/* Course includes */}
                            <div className='bg-white rounded-2xl border
                              border-indigo-100 p-5'>
                                <h3 className='font-bold text-indigo-900 text-sm mb-4'>
                                    This course includes
                                </h3>
                                <div className='grid grid-cols-2 gap-3'>
                                    {[
                                        { icon: '📹', text: `${totalLessons} video lessons` },
                                        { icon: '⏱️', text: `${totalDuration} of content` },
                                        { icon: '🆓', text: `${freeLessons} free previews` },
                                        { icon: '📱', text: 'Access on all devices' },
                                        { icon: '♾️', text: 'Lifetime access' },
                                        { icon: '📝', text: 'Lesson notes included' },
                                    ].map(({ icon, text }) => (
                                        <div key={text}
                                            className='flex items-center gap-2 text-sm
                                    text-indigo-600'>
                                            <span>{icon}</span>
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lessons tab */}
                    {activeTab === 'lessons' && (
                        <div>
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='text-lg font-extrabold text-indigo-900'>
                                    Course Content
                                </h2>
                                <span className='text-xs text-indigo-400'>
                                    {totalLessons} lessons · {totalDuration}
                                </span>
                            </div>

                            <div className='space-y-2'>
                                {course.lessons?.map((lesson, index) => (
                                    <div
                                        key={lesson._id}
                                        className={`flex items-center gap-4 p-4
                                rounded-xl border transition-all
                                ${enrolled || lesson.isFree
                                                ? 'bg-white border-indigo-100 hover:border-indigo-300 cursor-pointer'
                                                : 'bg-indigo-50/50 border-indigo-100 cursor-not-allowed opacity-75'
                                            }`}
                                        onClick={() => {
                                            if (enrolled || lesson.isFree) {
                                                navigate(
                                                    `/learn/${course._id}/${lesson._id}`
                                                )
                                            }
                                        }}
                                    >
                                        {/* Lesson number */}
                                        <span className='text-xs font-bold
                                     text-indigo-400 w-6
                                     flex-shrink-0'>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>

                                        {/* Play/lock icon */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center
                                    justify-center flex-shrink-0 text-sm
                                    ${enrolled || lesson.isFree
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-indigo-100 text-indigo-300'
                                            }`}>
                                            {enrolled || lesson.isFree ? '▶' : '🔒'}
                                        </div>

                                        {/* Lesson info */}
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-semibold
                                    text-indigo-900 line-clamp-1'>
                                                {lesson.title}
                                            </p>
                                            {lesson.duration > 0 && (
                                                <p className='text-xs text-indigo-400 mt-0.5'>
                                                    {formatDuration(lesson.duration)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Free badge */}
                                        {lesson.isFree && !enrolled && (
                                            <span className='text-xs font-bold text-emerald-700
                                       bg-emerald-50 border border-emerald-200
                                       px-2 py-0.5 rounded-full flex-shrink-0'>
                                                Free Preview
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags tab */}
                    {activeTab === 'tags' && (
                        <div>
                            <h2 className='text-lg font-extrabold text-indigo-900 mb-4'>
                                Course Tags
                            </h2>
                            {course.tags?.length > 0 ? (
                                <div className='flex flex-wrap gap-2'>
                                    {course.tags.map(tag => (
                                        <Link
                                            key={tag}
                                            to={`/courses?search=${tag}`}
                                            className='text-sm font-semibold text-indigo-600
                                 bg-indigo-50 border border-indigo-200
                                 px-3 py-1.5 rounded-xl
                                 hover:bg-indigo-100 transition-all'
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className='text-indigo-400 text-sm'>
                                    No tags added for this course.
                                </p>
                            )}
                        </div>
                    )}

                </div>

                {/* ── Right column — Enroll card ────────────────────── */}
                <div className='lg:col-span-1'>
                    <div className='bg-white rounded-2xl border border-indigo-100
                          shadow-xl shadow-indigo-100 p-6 sticky top-24'>

                        {/* Thumbnail */}
                        <img
                            src={
                                course.thumbnail ||
                                `https://via.placeholder.com/400x220?text=${encodeURIComponent(course.title)}`
                            }
                            alt={course.title}
                            className='w-full h-44 object-cover rounded-xl mb-5'
                        />

                        {/* Price */}
                        <div className='mb-4'>
                            {course.price === 0 ? (
                                <span className='text-3xl font-extrabold
                                 text-emerald-600'>
                                    Free
                                </span>
                            ) : (
                                <div className='flex items-baseline gap-3'>
                                    <span className='text-3xl font-extrabold
                                   text-indigo-900'>
                                        ₹{course.discountPrice || course.price}
                                    </span>
                                    {course.discountPrice > 0 && (
                                        <>
                                            <span className='text-lg text-indigo-300
                                       line-through'>
                                                ₹{course.price}
                                            </span>
                                            <span className='text-sm font-bold
                                       text-emerald-600'>
                                                {Math.round(
                                                    ((course.price - course.discountPrice) /
                                                        course.price) * 100
                                                )}% off
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Enroll section */}
                        {enrolled ? (
                            <div className='space-y-3'>
                                {/* Already enrolled message */}
                                <div className='bg-emerald-50 border border-emerald-200
                                rounded-xl p-4 text-center'>
                                    <p className='text-emerald-700 font-bold text-sm mb-1'>
                                        You are enrolled!
                                    </p>
                                    <p className='text-emerald-600 text-xs'>
                                        {progress}% complete
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className='h-2 bg-indigo-100 rounded-full
                                overflow-hidden'>
                                    <div
                                        className='h-full bg-indigo-600 rounded-full
                               transition-all duration-500'
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                {/* Continue button */}
                                <button
                                    onClick={() => {
                                        const firstLesson = course.lessons?.[0]
                                        if (firstLesson) {
                                            navigate(
                                                `/learn/${course._id}/${firstLesson._id}`
                                            )
                                        }
                                    }}
                                    className='w-full bg-emerald-600 text-white py-3.5
                             rounded-xl font-bold text-sm
                             hover:bg-emerald-500 transition-all
                             shadow-lg shadow-emerald-100'
                                >
                                    Continue Learning →
                                </button>
                            </div>
                        ) : (
                            <EnrollButton
                                course={course}
                                onEnrollSuccess={handleEnrollSuccess}
                            />
                        )}

                        {/* Money back note */}
                        {course.price > 0 && !enrolled && (
                            <p className='text-center text-xs text-indigo-400 mt-3'>
                                Secure payment via Razorpay
                            </p>
                        )}

                        {/* Course quick stats */}
                        <div className='mt-5 pt-5 border-t border-indigo-100
                            space-y-2.5'>
                            {[
                                { label: 'Total lessons', value: totalLessons },
                                { label: 'Total duration', value: totalDuration },
                                { label: 'Level', value: course.level },
                                { label: 'Language', value: course.language || 'English' },
                                { label: 'Students', value: course.enrolledStudents?.length || 0 },
                            ].map(({ label, value }) => (
                                <div key={label}
                                    className='flex items-center justify-between
                                text-sm'>
                                    <span className='text-indigo-400'>{label}</span>
                                    <span className='font-semibold text-indigo-800'>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default CourseDetail