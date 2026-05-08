import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from './features/auth/authSlice'

// Layout components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Route guard
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import CourseList from './pages/CourseList'
import CourseDetail from './pages/CourseDetail'

// Lesson page
import LessonPlayer from './pages/LessonPlayer'

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import CreateCourse from './pages/teacher/CreateCourse'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import MyCourses from './pages/student/MyCourses'

function App() {
    const dispatch = useDispatch()
    const { token } = useSelector(s => s.auth)
    const [isInverted, setIsInverted] = useState(() => {
        return localStorage.getItem('invertMode') === 'true'
    })

    // On app load — refresh user profile if token exists
    // This keeps user data fresh after page refresh
    useEffect(() => {
        if (token) {
            dispatch(fetchMe())
        }
    }, [dispatch, token])

    // Apply invert filter to document
    useEffect(() => {
        if (isInverted) {
            document.documentElement.style.filter = 'invert(1)'
            localStorage.setItem('invertMode', 'true')
        } else {
            document.documentElement.style.filter = 'invert(0)'
            localStorage.setItem('invertMode', 'false')
        }
    }, [isInverted])

    return (
        <div className='min-h-screen bg-indigo-50 flex flex-col' data-invert={isInverted}>

            {/* Navbar shows on every page */}
            <Navbar isInverted={isInverted} setIsInverted={setIsInverted} />

            {/* Main content area */}
            <main className='flex-1'>
                <Routes>

                    {/* ── Public routes ──────────────────────── */}
                    <Route path='/' element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/auth/callback' element={<AuthCallback />} />
                    <Route path='/courses' element={<CourseList />} />
                    <Route path='/courses/:id' element={<CourseDetail />} />

                    {/* ── Student protected routes ───────────── */}
                    <Route element={<ProtectedRoute role='student' />}>
                        <Route
                            path='/learn/:courseId/:lessonId'
                            element={<LessonPlayer />}
                        />
                        <Route
                            path='/dashboard/student'
                            element={<StudentDashboard />}
                        />
                        <Route
                            path='/my-courses'
                            element={<MyCourses />}
                        />
                    </Route>

                    {/* ── Teacher protected routes ───────────── */}
                    <Route element={<ProtectedRoute role='teacher' />}>
                        <Route
                            path='/dashboard/teacher'
                            element={<TeacherDashboard />}
                        />
                        <Route
                            path='/dashboard/courses/new'
                            element={<CreateCourse />}
                        />
                    </Route>

                    {/* ── 404 fallback ───────────────────────── */}
                    <Route
                        path='*'
                        element={
                            <div className='flex flex-col items-center justify-center min-h-[60vh] text-center px-4'>
                                <div className='text-8xl font-extrabold text-indigo-200 mb-4'>
                                    404
                                </div>
                                <h1 className='text-2xl font-extrabold text-indigo-900 mb-2'>
                                    Page not found
                                </h1>
                                <p className='text-indigo-400 mb-6'>
                                    The page you are looking for does not exist.
                                </p>
                                <a
                                    href='/'
                                    className='bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600'
                                >
                                    Go back home
                                </a>
                            </div>
                        }
                    />
                </Routes>
            </main>

            {/* Footer shows on every page */}
            <Footer />
        </div>
    )
}

export default App