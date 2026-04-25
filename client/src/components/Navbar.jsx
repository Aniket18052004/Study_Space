import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'

const Navbar = () => {
    const { user } = useSelector(s => s.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
        setMenuOpen(false)
    }

    return (
        <nav className='bg-white/85 backdrop-blur-md border-b border-indigo-200
                    sticky top-0 z-50 shadow-sm'>
            <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>

                {/* ── Logo ─────────────────────────────── */}
                <Link
                    to='/'
                    className='font-extrabold text-xl text-indigo-900 tracking-tight
                     flex items-center gap-1'
                >
                    Study
                    <span className='text-emerald-500'>·</span>
                    Space
                </Link>

                {/* ── Desktop nav links ─────────────────── */}
                <div className='hidden md:flex items-center gap-8'>
                    <Link
                        to='/courses'
                        className='text-sm font-semibold text-indigo-500
                       hover:text-indigo-800 transition-colors'
                    >
                        Courses
                    </Link>

                    {user?.role === 'teacher' && (
                        <Link
                            to='/dashboard/teacher'
                            className='text-sm font-semibold text-indigo-500
                         hover:text-indigo-800 transition-colors'
                        >
                            Dashboard
                        </Link>
                    )}

                    {user?.role === 'student' && (
                        <Link
                            to='/my-courses'
                            className='text-sm font-semibold text-indigo-500
                         hover:text-indigo-800 transition-colors'
                        >
                            My Courses
                        </Link>
                    )}

                    {user?.role === 'student' && (
                        <Link
                            to='/dashboard/student'
                            className='text-sm font-semibold text-indigo-500
                         hover:text-indigo-800 transition-colors'
                        >
                            Progress
                        </Link>
                    )}
                </div>

                {/* ── Auth buttons ──────────────────────── */}
                <div className='hidden md:flex items-center gap-3'>
                    {user ? (
                        <div className='flex items-center gap-3'>
                            {/* Avatar */}
                            <img
                                src={
                                    user.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3730A3&color=fff`
                                }
                                alt={user.name}
                                className='w-8 h-8 rounded-full object-cover
                           border-2 border-indigo-200'
                            />

                            {/* Name */}
                            <span className='text-sm font-semibold text-indigo-900'>
                                {user.name}
                            </span>

                            {/* Role badge */}
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                capitalize border
                ${user.role === 'teacher'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}>
                                {user.role}
                            </span>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className='text-sm font-bold text-indigo-700
                           border-2 border-indigo-200 px-3 py-1.5
                           rounded-xl hover:bg-indigo-50'
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className='flex items-center gap-2'>
                            <Link
                                to='/login'
                                className='text-sm font-bold text-indigo-700
                           border-2 border-indigo-200 px-4 py-1.5
                           rounded-xl hover:bg-indigo-50'
                            >
                                Login
                            </Link>
                            <Link
                                to='/register'
                                className='text-sm font-bold text-white
                           bg-indigo-700 px-4 py-1.5 rounded-xl
                           hover:bg-indigo-600 shadow-md'
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Mobile hamburger ──────────────────── */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className='md:hidden flex flex-col gap-1.5 p-2'
                >
                    <span className={`block w-6 h-0.5 bg-indigo-700 transition-all
            ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-indigo-700 transition-all
            ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-indigo-700 transition-all
            ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>

            </div>

            {/* ── Mobile menu ───────────────────────────── */}
            {menuOpen && (
                <div className='md:hidden bg-white border-t border-indigo-100
                        px-6 py-4 flex flex-col gap-4'>
                    <Link
                        to='/courses'
                        onClick={() => setMenuOpen(false)}
                        className='text-sm font-semibold text-indigo-700'
                    >
                        Courses
                    </Link>

                    {user?.role === 'teacher' && (
                        <Link
                            to='/dashboard/teacher'
                            onClick={() => setMenuOpen(false)}
                            className='text-sm font-semibold text-indigo-700'
                        >
                            Dashboard
                        </Link>
                    )}

                    {user?.role === 'student' && (
                        <>
                            <Link
                                to='/my-courses'
                                onClick={() => setMenuOpen(false)}
                                className='text-sm font-semibold text-indigo-700'
                            >
                                My Courses
                            </Link>
                            <Link
                                to='/dashboard/student'
                                onClick={() => setMenuOpen(false)}
                                className='text-sm font-semibold text-indigo-700'
                            >
                                Progress
                            </Link>
                        </>
                    )}

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className='text-sm font-bold text-red-600 text-left'
                        >
                            Logout
                        </button>
                    ) : (
                        <div className='flex gap-3'>
                            <Link
                                to='/login'
                                onClick={() => setMenuOpen(false)}
                                className='text-sm font-bold text-indigo-700
                           border-2 border-indigo-200 px-4 py-1.5
                           rounded-xl'
                            >
                                Login
                            </Link>
                            <Link
                                to='/register'
                                onClick={() => setMenuOpen(false)}
                                className='text-sm font-bold text-white
                           bg-indigo-700 px-4 py-1.5 rounded-xl'
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar