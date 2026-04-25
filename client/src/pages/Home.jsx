import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../utils/axiosInstance'
import CourseCard from '../components/CourseCard'

const Home = () => {
    const { user } = useSelector(s => s.auth)
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch featured courses on mount
    useEffect(() => {
        api.get('/courses?limit=4')
            .then(r => {
                setCourses(r.data.courses)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div>

            {/* ── HERO SECTION ─────────────────────────────────────── */}
            <div className='relative overflow-hidden bg-indigo-50'>

                {/* Background decoration circles */}
                <div className='absolute top-0 left-0 w-72 h-72 bg-indigo-200
                        rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2' />
                <div className='absolute bottom-0 right-0 w-96 h-96 bg-purple-200
                        rounded-full opacity-20 translate-x-1/3 translate-y-1/3' />
                <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-100
                        rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2' />

                <div className='relative max-w-5xl mx-auto px-6 py-24 text-center'>

                    {/* Badge */}
                    <div className='inline-flex items-center gap-2 bg-indigo-100
                          text-indigo-700 text-xs font-bold px-4 py-2
                          rounded-full mb-6 border border-indigo-200'>
                        <span className='w-2 h-2 bg-emerald-500 rounded-full' />
                        Your personal study hub — for teachers and students
                    </div>

                    {/* Heading */}
                    <h1 className='text-5xl md:text-6xl font-extrabold text-indigo-900
                         leading-tight tracking-tight mb-5'>
                        Learn Smarter,
                        <br />
                        <span className='text-indigo-500 relative inline-block'>
                            Not Harder
                            {/* Underline decoration */}
                            <span className='absolute bottom-1 left-0 w-full h-3
                               bg-emerald-200 -z-10 rounded' />
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className='text-lg text-indigo-500 max-w-xl mx-auto
                        mb-10 leading-relaxed'>
                        A focused platform where teachers sell expert courses
                        and students learn with confidence — all in one place.
                    </p>

                    {/* CTA buttons */}
                    <div className='flex flex-wrap gap-4 justify-center'>
                        <Link
                            to='/courses'
                            className='bg-indigo-700 text-white px-8 py-3.5
                         rounded-xl font-bold text-sm hover:bg-indigo-600
                         shadow-lg shadow-indigo-200 transition-all'
                        >
                            Browse Courses →
                        </Link>

                        {!user && (
                            <Link
                                to='/register'
                                className='border-2 border-indigo-300 text-indigo-700
                           px-8 py-3.5 rounded-xl font-bold text-sm
                           hover:bg-indigo-100 transition-all'
                            >
                                Get Started Free
                            </Link>
                        )}

                        {user?.role === 'teacher' && (
                            <Link
                                to='/dashboard/courses/new'
                                className='border-2 border-indigo-300 text-indigo-700
                           px-8 py-3.5 rounded-xl font-bold text-sm
                           hover:bg-indigo-100 transition-all'
                            >
                                Create a Course
                            </Link>
                        )}

                        {user?.role === 'student' && (
                            <Link
                                to='/my-courses'
                                className='border-2 border-indigo-300 text-indigo-700
                           px-8 py-3.5 rounded-xl font-bold text-sm
                           hover:bg-indigo-100 transition-all'
                            >
                                My Learning
                            </Link>
                        )}
                    </div>

                </div>
            </div>

            {/* ── STATS BAR ────────────────────────────────────────── */}
            <div className='bg-white border-y border-indigo-100'>
                <div className='max-w-5xl mx-auto px-6 py-6
                        grid grid-cols-2 md:grid-cols-4 gap-6'>
                    {[
                        { num: '12K+', label: 'Active Learners' },
                        { num: '340+', label: 'Study Topics' },
                        { num: '98%', label: 'Satisfaction Rate' },
                        { num: '4.9 ★', label: 'Average Rating' },
                    ].map(({ num, label }) => (
                        <div key={label} className='text-center'>
                            <div className='text-2xl font-extrabold text-indigo-700
                              tracking-tight'>
                                {num}
                            </div>
                            <div className='text-xs font-semibold text-indigo-400 mt-1'>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FEATURED COURSES ─────────────────────────────────── */}
            <div className='max-w-7xl mx-auto px-6 py-16'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <p className='text-xs font-bold text-emerald-600
                          uppercase tracking-widest mb-1'>
                            Explore Topics
                        </p>
                        <h2 className='text-2xl font-extrabold text-indigo-900
                           tracking-tight'>
                            Popular Courses
                        </h2>
                    </div>
                    <Link
                        to='/courses'
                        className='text-sm font-bold text-indigo-600
                       hover:text-indigo-800 hover:underline'
                    >
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-4 gap-5'>
                        {[1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                className='bg-white rounded-2xl border border-indigo-100
                           h-64 animate-pulse'
                            >
                                <div className='bg-indigo-100 h-44 rounded-t-2xl' />
                                <div className='p-4 space-y-2'>
                                    <div className='bg-indigo-100 h-3 rounded w-3/4' />
                                    <div className='bg-indigo-100 h-3 rounded w-1/2' />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className='text-center py-16 text-indigo-400'>
                        No courses available yet. Check back soon!
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-4 gap-5'>
                        {courses.map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── HOW IT WORKS ─────────────────────────────────────── */}
            <div className='bg-white border-y border-indigo-100 py-16'>
                <div className='max-w-5xl mx-auto px-6'>
                    <div className='text-center mb-12'>
                        <p className='text-xs font-bold text-emerald-600
                          uppercase tracking-widest mb-2'>
                            Simple Process
                        </p>
                        <h2 className='text-2xl font-extrabold text-indigo-900'>
                            How StudySpace Works
                        </h2>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>

                        {/* For Students */}
                        <div>
                            <div className='inline-flex items-center gap-2 bg-indigo-50
                              text-indigo-700 text-xs font-bold px-3 py-1.5
                              rounded-full border border-indigo-200 mb-6'>
                                For Students
                            </div>
                            <div className='space-y-5'>
                                {[
                                    {
                                        step: '01',
                                        title: 'Create a free account',
                                        desc: 'Sign up as a student in seconds with email or Google.',
                                    },
                                    {
                                        step: '02',
                                        title: 'Browse and enroll',
                                        desc: 'Find courses by subject, level, or price. Enroll free or pay once.',
                                    },
                                    {
                                        step: '03',
                                        title: 'Learn at your pace',
                                        desc: 'Watch lessons, read notes, and track your progress anytime.',
                                    },
                                ].map(({ step, title, desc }) => (
                                    <div key={step} className='flex gap-4'>
                                        <div className='w-10 h-10 rounded-xl bg-indigo-700
                                    text-white text-xs font-extrabold
                                    flex items-center justify-center
                                    flex-shrink-0'>
                                            {step}
                                        </div>
                                        <div>
                                            <h3 className='font-bold text-indigo-900 text-sm mb-0.5'>
                                                {title}
                                            </h3>
                                            <p className='text-xs text-indigo-400 leading-relaxed'>
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* For Teachers */}
                        <div>
                            <div className='inline-flex items-center gap-2 bg-amber-50
                              text-amber-700 text-xs font-bold px-3 py-1.5
                              rounded-full border border-amber-200 mb-6'>
                                For Teachers
                            </div>
                            <div className='space-y-5'>
                                {[
                                    {
                                        step: '01',
                                        title: 'Register as a teacher',
                                        desc: 'Create your teacher account and set up your profile.',
                                    },
                                    {
                                        step: '02',
                                        title: 'Create and publish courses',
                                        desc: 'Upload videos, add notes, set your price and publish.',
                                    },
                                    {
                                        step: '03',
                                        title: 'Earn and grow',
                                        desc: 'Students enroll, you earn. Track revenue from your dashboard.',
                                    },
                                ].map(({ step, title, desc }) => (
                                    <div key={step} className='flex gap-4'>
                                        <div className='w-10 h-10 rounded-xl bg-amber-600
                                    text-white text-xs font-extrabold
                                    flex items-center justify-center
                                    flex-shrink-0'>
                                            {step}
                                        </div>
                                        <div>
                                            <h3 className='font-bold text-indigo-900 text-sm mb-0.5'>
                                                {title}
                                            </h3>
                                            <p className='text-xs text-indigo-400 leading-relaxed'>
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── CATEGORIES SECTION ───────────────────────────────── */}
            <div className='max-w-7xl mx-auto px-6 py-16'>
                <div className='text-center mb-10'>
                    <p className='text-xs font-bold text-emerald-600
                        uppercase tracking-widest mb-2'>
                        What We Teach
                    </p>
                    <h2 className='text-2xl font-extrabold text-indigo-900'>
                        Browse by Subject
                    </h2>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
                    {[
                        { label: 'Mathematics', icon: '📐', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                        { label: 'Physics', icon: '⚛️', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                        { label: 'Biology', icon: '🧬', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                        { label: 'Chemistry', icon: '⚗️', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                        { label: 'CS', icon: '💻', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                        { label: 'English', icon: '📖', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                    ].map(({ label, icon, color }) => (
                        <Link
                            key={label}
                            to={`/courses?category=${label}`}
                            className={`flex flex-col items-center gap-3 p-4
                          rounded-2xl border-2 font-bold text-sm
                          hover:-translate-y-1 hover:shadow-md
                          transition-all ${color}`}
                        >
                            <span className='text-3xl'>{icon}</span>
                            {label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── CTA BANNER ───────────────────────────────────────── */}
            {!user && (
                <div className='bg-indigo-900 mx-6 mb-16 rounded-2xl
                        overflow-hidden relative'>
                    {/* Decoration */}
                    <div className='absolute top-0 right-0 w-64 h-64
                          bg-indigo-800 rounded-full
                          translate-x-1/3 -translate-y-1/3 opacity-50' />
                    <div className='absolute bottom-0 left-0 w-48 h-48
                          bg-purple-900 rounded-full
                          -translate-x-1/4 translate-y-1/4 opacity-50' />

                    <div className='relative max-w-3xl mx-auto px-8 py-14 text-center'>
                        <h2 className='text-3xl font-extrabold text-white mb-3'>
                            Ready to start learning?
                        </h2>
                        <p className='text-indigo-300 mb-8 text-sm leading-relaxed'>
                            Join 12,000+ students already learning on StudySpace.
                            Sign up free — no credit card required.
                        </p>
                        <div className='flex gap-4 justify-center flex-wrap'>
                            <Link
                                to='/register'
                                className='bg-white text-indigo-900 px-8 py-3.5
                           rounded-xl font-bold text-sm
                           hover:bg-indigo-50 transition-all'
                            >
                                Sign Up Free →
                            </Link>
                            <Link
                                to='/courses'
                                className='border-2 border-indigo-600 text-indigo-300
                           px-8 py-3.5 rounded-xl font-bold text-sm
                           hover:border-indigo-400 hover:text-white
                           transition-all'
                            >
                                Browse Courses
                            </Link>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Home