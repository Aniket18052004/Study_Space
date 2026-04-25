import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../utils/axiosInstance'

const LessonPlayer = () => {
    const { courseId, lessonId } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)
    const videoRef = useRef(null)

    const [course, setCourse] = useState(null)
    const [lesson, setLesson] = useState(null)
    const [enrollment, setEnrollment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [videoError, setVideoError] = useState(false)

    // ── Fetch all data ────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setVideoError(false)

                const [courseRes, enrollRes] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/enrollments/${courseId}/check`),
                ])

                const courseData = courseRes.data
                setCourse(courseData)
                setEnrollment(enrollRes.data)

                // Find current lesson
                const currentLesson = courseData.lessons?.find(
                    l => l._id === lessonId
                )

                if (currentLesson) {
                    // Fetch full lesson with video URL
                    const lessonRes = await api.get(`/lessons/${currentLesson._id}`)
                    setLesson(lessonRes.data)
                } else {
                    // Lesson not found — go to first lesson
                    const firstLesson = courseData.lessons?.[0]
                    if (firstLesson) {
                        navigate(`/learn/${courseId}/${firstLesson._id}`, {
                            replace: true,
                        })
                    }
                }
            } catch (err) {
                console.error('Failed to load lesson:', err)
                if (err.response?.status === 403) {
                    navigate(`/courses/${courseId}`)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [courseId, lessonId])

    // Reset video error when lesson changes
    useEffect(() => {
        setVideoError(false)
        // Scroll to top when lesson changes
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [lessonId])

    // ── Mark lesson as complete ───────────────────────────────────
    const markComplete = async () => {
        if (marking || isCompleted) return
        setMarking(true)
        try {
            const { data } = await api.patch(
                `/enrollments/${courseId}/progress`,
                { lessonId: lesson._id }
            )
            setEnrollment(prev => ({
                ...prev,
                progress: data.progress,
                completedLessons: data.completedLessons,
            }))
        } catch (err) {
            console.error('Failed to mark complete:', err)
        } finally {
            setMarking(false)
        }
    }

    // ── Navigate between lessons ──────────────────────────────────
    const getLessonIndex = () =>
        course?.lessons?.findIndex(l => l._id === lessonId) ?? -1

    const goToLesson = (targetLesson) => {
        if (targetLesson) {
            navigate(`/learn/${courseId}/${targetLesson._id}`)
        }
    }

    const currentIndex = getLessonIndex()
    const prevLesson = course?.lessons?.[currentIndex - 1]
    const nextLesson = course?.lessons?.[currentIndex + 1]

    const isCompleted = enrollment?.completedLessons
        ?.map(id => id.toString())
        ?.includes(lessonId)

    const formatDuration = (seconds) => {
        if (!seconds) return '0m'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    // ── Loading state ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className='flex h-[calc(100vh-64px)]'>
                {/* Sidebar skeleton */}
                <div className='w-72 bg-white border-r border-indigo-100
                        flex-shrink-0 p-4 space-y-3 animate-pulse'>
                    <div className='bg-indigo-100 h-4 rounded w-3/4' />
                    <div className='bg-indigo-100 h-2 rounded' />
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className='flex gap-3 items-center'>
                            <div className='bg-indigo-100 w-8 h-8 rounded-lg flex-shrink-0' />
                            <div className='bg-indigo-100 h-3 rounded flex-1' />
                        </div>
                    ))}
                </div>
                {/* Main skeleton */}
                <div className='flex-1 p-8 space-y-4 animate-pulse'>
                    <div className='bg-indigo-100 h-8 rounded w-2/3' />
                    <div className='bg-indigo-100 rounded-2xl h-96' />
                </div>
            </div>
        )
    }

    if (!course || !lesson) return null

    return (
        <div className='flex h-[calc(100vh-64px)] overflow-hidden'>

            {/* ── SIDEBAR ──────────────────────────────────────────── */}
            <aside className={`bg-white border-r border-indigo-100
                         flex-shrink-0 flex flex-col
                         transition-all duration-300
                         ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>

                {/* Sidebar header */}
                <div className='p-4 border-b border-indigo-100 flex-shrink-0'>
                    <Link
                        to={`/courses/${courseId}`}
                        className='text-xs font-bold text-indigo-500
                       hover:text-indigo-700 mb-2 block'
                    >
                        ← Back to course
                    </Link>
                    <h2 className='font-extrabold text-indigo-900 text-sm
                         line-clamp-2 leading-snug mb-3'>
                        {course.title}
                    </h2>

                    {/* Progress bar */}
                    {enrollment && (
                        <div>
                            <div className='flex justify-between text-xs
                              text-indigo-400 mb-1'>
                                <span>Your progress</span>
                                <span className='font-bold text-indigo-600'>
                                    {enrollment.progress}%
                                </span>
                            </div>
                            <div className='h-1.5 bg-indigo-100 rounded-full
                              overflow-hidden'>
                                <div
                                    className='h-full bg-indigo-600 rounded-full
                             transition-all duration-500'
                                    style={{ width: `${enrollment.progress}%` }}
                                />
                            </div>
                            <p className='text-xs text-indigo-400 mt-1'>
                                {enrollment.completedLessons?.length || 0} of{' '}
                                {course.lessons?.length} lessons completed
                            </p>
                        </div>
                    )}
                </div>

                {/* Lesson list */}
                <div className='flex-1 overflow-y-auto p-3'>
                    {course.lessons?.map((l, index) => {
                        const isCurrent = l._id === lessonId
                        const isDone = enrollment?.completedLessons
                            ?.map(id => id.toString())
                            ?.includes(l._id)

                        return (
                            <button
                                key={l._id}
                                onClick={() => goToLesson(l)}
                                className={`w-full flex items-center gap-3 px-3 py-3
                            rounded-xl mb-1 text-left transition-all
                            ${isCurrent
                                        ? 'bg-indigo-50 border border-indigo-200'
                                        : 'hover:bg-indigo-50 border border-transparent'
                                    }`}
                            >
                                {/* Completion indicator */}
                                <div className={`w-7 h-7 rounded-lg flex items-center
                                 justify-center text-xs font-bold
                                 flex-shrink-0
                                 ${isDone
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : isCurrent
                                            ? 'bg-indigo-700 text-white'
                                            : 'bg-indigo-100 text-indigo-500'
                                    }`}>
                                    {isDone ? '✓' : index + 1}
                                </div>

                                {/* Lesson info */}
                                <div className='flex-1 min-w-0'>
                                    <p className={`text-xs font-semibold line-clamp-2
                                 leading-snug
                                 ${isCurrent
                                            ? 'text-indigo-800'
                                            : 'text-indigo-600'
                                        }`}>
                                        {l.title}
                                    </p>
                                    {l.duration > 0 && (
                                        <p className='text-xs text-indigo-400 mt-0.5'>
                                            {formatDuration(l.duration)}
                                        </p>
                                    )}
                                </div>

                                {/* Currently playing indicator */}
                                {isCurrent && (
                                    <div className='w-1.5 h-1.5 rounded-full
                                  bg-indigo-600 flex-shrink-0' />
                                )}
                            </button>
                        )
                    })}
                </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────── */}
            <main className='flex-1 overflow-y-auto bg-indigo-50'>

                {/* Top bar */}
                <div className='bg-white border-b border-indigo-100
                        px-4 py-2 flex items-center gap-4
                        sticky top-0 z-10'>

                    {/* Toggle sidebar */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className='p-2 rounded-lg hover:bg-indigo-50
                       text-indigo-500 flex-shrink-0'
                        title='Toggle sidebar'
                    >
                        <svg className='w-4 h-4' fill='none'
                            viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 6h16M4 12h16M4 18h7' />
                        </svg>
                    </button>

                    {/* Lesson title */}
                    <h1 className='text-sm font-bold text-indigo-900
                         line-clamp-1 flex-1'>
                        {lesson.title}
                    </h1>

                    {/* Prev / Next buttons */}
                    <div className='flex items-center gap-2 flex-shrink-0'>
                        <button
                            onClick={() => goToLesson(prevLesson)}
                            disabled={!prevLesson}
                            className='px-3 py-1.5 rounded-lg text-xs font-bold
                         border border-indigo-200 text-indigo-600
                         hover:bg-indigo-50 disabled:opacity-40
                         disabled:cursor-not-allowed'
                        >
                            ← Prev
                        </button>
                        <span className='text-xs text-indigo-400 font-semibold'>
                            {currentIndex + 1} / {course.lessons?.length}
                        </span>
                        <button
                            onClick={() => goToLesson(nextLesson)}
                            disabled={!nextLesson}
                            className='px-3 py-1.5 rounded-lg text-xs font-bold
                         border border-indigo-200 text-indigo-600
                         hover:bg-indigo-50 disabled:opacity-40
                         disabled:cursor-not-allowed'
                        >
                            Next →
                        </button>
                    </div>
                </div>

                <div className='max-w-4xl mx-auto px-6 py-8'>

                    {/* ── Video player ─────────────────────────────────── */}
                    {lesson.videoUrl && !videoError ? (
                        <div className='relative bg-black rounded-2xl
                            overflow-hidden mb-6 shadow-lg'>
                            <video
                                ref={videoRef}
                                key={lesson.videoUrl}
                                controls
                                src={lesson.videoUrl}
                                className='w-full max-h-[520px]'
                                onError={() => setVideoError(true)}
                                onEnded={markComplete}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ) : lesson.videoUrl && videoError ? (
                        // Video error state
                        <div className='bg-white rounded-2xl border
                            border-red-100 p-8 text-center mb-6'>
                            <div className='text-4xl mb-3'>⚠️</div>
                            <h3 className='font-bold text-red-700 mb-2'>
                                Video failed to load
                            </h3>
                            <p className='text-sm text-red-500 mb-4'>
                                There was an error playing this video.
                                Please try refreshing.
                            </p>
                            <button
                                onClick={() => setVideoError(false)}
                                className='bg-indigo-700 text-white px-5 py-2
                           rounded-xl text-sm font-bold
                           hover:bg-indigo-600'
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        // No video uploaded
                        <div className='bg-white rounded-2xl border
                            border-indigo-100 h-72 flex flex-col
                            items-center justify-center mb-6
                            text-indigo-400'>
                            <div className='text-4xl mb-3'>🎬</div>
                            <p className='text-sm font-semibold'>
                                No video uploaded for this lesson yet
                            </p>
                        </div>
                    )}

                    {/* ── Lesson header ─────────────────────────────────── */}
                    <div className='flex items-start justify-between
                          gap-4 mb-6'>
                        <div>
                            <h2 className='text-xl font-extrabold text-indigo-900
                             mb-1'>
                                {lesson.title}
                            </h2>
                            <div className='flex items-center gap-3
                              text-xs text-indigo-400'>
                                <span>Lesson {currentIndex + 1}</span>
                                {lesson.duration > 0 && (
                                    <>
                                        <span>·</span>
                                        <span>{formatDuration(lesson.duration)}</span>
                                    </>
                                )}
                                {lesson.isFree && (
                                    <>
                                        <span>·</span>
                                        <span className='text-emerald-600 font-bold'>
                                            Free Preview
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mark complete button */}
                        <button
                            onClick={markComplete}
                            disabled={marking || isCompleted}
                            className={`flex-shrink-0 flex items-center gap-2
                          px-4 py-2.5 rounded-xl text-sm font-bold
                          transition-all
                          ${isCompleted
                                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-default'
                                    : 'bg-indigo-700 text-white hover:bg-indigo-600 shadow-md disabled:opacity-60'
                                }`}
                        >
                            {marking ? (
                                <>
                                    <span className='w-3.5 h-3.5 border-2
                                   border-current border-t-transparent
                                   rounded-full animate-spin' />
                                    Marking...
                                </>
                            ) : isCompleted ? (
                                <>
                                    <span>✓</span>
                                    Completed
                                </>
                            ) : (
                                <>
                                    <span>✓</span>
                                    Mark Complete
                                </>
                            )}
                        </button>
                    </div>

                    {/* ── Lesson notes ─────────────────────────────────── */}
                    {lesson.notes && (
                        <div className='bg-white rounded-2xl border
                            border-indigo-100 p-6 mb-6'>
                            <h3 className='font-extrabold text-indigo-900
                             text-base mb-4 flex items-center gap-2'>
                                <span className='text-xl'>📝</span>
                                Lesson Notes
                            </h3>
                            <div className='text-sm text-indigo-700 leading-relaxed
                              whitespace-pre-wrap'>
                                {lesson.notes}
                            </div>
                        </div>
                    )}

                    {/* ── Resources ────────────────────────────────────── */}
                    {lesson.resources?.length > 0 && (
                        <div className='bg-white rounded-2xl border
                            border-indigo-100 p-6 mb-6'>
                            <h3 className='font-extrabold text-indigo-900
                             text-base mb-4 flex items-center gap-2'>
                                <span className='text-xl'>📎</span>
                                Resources
                            </h3>
                            <div className='space-y-2'>
                                {lesson.resources.map((resource, i) => (
                                    <a
                                        key={i}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                                    >
                                        <span className='text-indigo-500'>📄</span>
                                        <span className='text-sm font-semibold text-indigo-700 flex-1'>
                                            {resource.title}
                                        </span>
                                        <span className='text-xs text-indigo-400'>
                                            Download ↗
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Navigation footer ────────────────────────────── */}
                    <div className='flex items-center justify-between
                          pt-6 border-t border-indigo-200'>

                        {/* Previous lesson */}
                        {prevLesson ? (
                            <button
                                onClick={() => goToLesson(prevLesson)}
                                className='flex items-center gap-3 p-4
                           bg-white rounded-2xl border border-indigo-100
                           hover:border-indigo-300 hover:shadow-md
                           transition-all text-left max-w-xs'
                            >
                                <span className='text-indigo-400 text-lg
                                 flex-shrink-0'>←</span>
                                <div>
                                    <p className='text-xs text-indigo-400 mb-0.5'>
                                        Previous lesson
                                    </p>
                                    <p className='text-sm font-bold text-indigo-800
                                line-clamp-1'>
                                        {prevLesson.title}
                                    </p>
                                </div>
                            </button>
                        ) : (
                            <div />
                        )}

                        {/* Next lesson */}
                        {nextLesson ? (
                            <button
                                onClick={() => {
                                    if (!isCompleted) markComplete()
                                    goToLesson(nextLesson)
                                }}
                                className='flex items-center gap-3 p-4
                           bg-indigo-700 rounded-2xl
                           hover:bg-indigo-600 hover:shadow-md
                           transition-all text-right ml-auto'
                            >
                                <div>
                                    <p className='text-xs text-indigo-300 mb-0.5'>
                                        Next lesson
                                    </p>
                                    <p className='text-sm font-bold text-white
                                line-clamp-1'>
                                        {nextLesson.title}
                                    </p>
                                </div>
                                <span className='text-white text-lg flex-shrink-0'>
                                    →
                                </span>
                            </button>
                        ) : (
                            // Course complete banner
                            enrollment?.progress === 100 ? (
                                <div className='flex items-center gap-3 p-4
                                bg-emerald-50 rounded-2xl
                                border border-emerald-200 ml-auto'>
                                    <div>
                                        <p className='text-sm font-bold text-emerald-700'>
                                            Course Complete! 🎉
                                        </p>
                                        <p className='text-xs text-emerald-600'>
                                            You have finished all lessons
                                        </p>
                                    </div>
                                    <Link
                                        to='/my-courses'
                                        className='bg-emerald-600 text-white px-4 py-2
                               rounded-xl text-xs font-bold
                               hover:bg-emerald-500'
                                    >
                                        My Courses →
                                    </Link>
                                </div>
                            ) : null
                        )}

                    </div>

                </div>
            </main>
        </div>
    )
}

export default LessonPlayer