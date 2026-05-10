import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../features/auth/authSlice'

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, loading, error } = useSelector(s => s.auth)

    const [form, setForm] = useState({
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)

    // If already logged in — redirect away from login page
    useEffect(() => {
        if (user) {
            navigate(
                user.role === 'teacher'
                    ? '/dashboard/teacher'
                    : '/dashboard/student'
            )
        }
    }, [user, navigate])

    // Clear any previous errors when component mounts
    useEffect(() => {
        dispatch(clearError())
    }, [dispatch])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Basic validation
        if (!form.email || !form.password) return

        const result = await dispatch(loginUser(form))

        if (loginUser.fulfilled.match(result)) {
            const role = result.payload.user.role
            navigate(
                role === 'teacher'
                    ? '/dashboard/teacher'
                    : '/dashboard/student'
            )
        }
    }
    return (
        <div className='min-h-screen bg-indigo-50 flex items-center
                    justify-center p-4 relative overflow-hidden'>

            {/* Background decoration */}
            <div className='absolute top-0 left-0 w-72 h-72 bg-indigo-200
                      rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2' />
            <div className='absolute bottom-0 right-0 w-96 h-96 bg-purple-200
                      rounded-full opacity-20 translate-x-1/3 translate-y-1/3' />

            <div className='relative w-full max-w-md'>

                {/* Card */}
                <div className='bg-white rounded-2xl border border-indigo-100
                        shadow-xl shadow-indigo-100 p-8'>

                    {/* Logo */}
                    <div className='text-center mb-8'>
                        <Link
                            to='/'
                            className='text-2xl font-extrabold text-indigo-900
                         tracking-tight inline-block'
                        >
                            Study<span className='text-emerald-500'>·</span>Space
                        </Link>
                        <h1 className='text-xl font-extrabold text-indigo-900
                           mt-4 mb-1'>
                            Welcome back
                        </h1>
                        <p className='text-sm text-indigo-400'>
                            Login to your StudySpace account
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className='bg-red-50 border border-red-200
                            text-red-700 text-sm rounded-xl
                            p-3 mb-5 flex items-start gap-2'>
                            <span className='text-red-500 mt-0.5'>⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className='space-y-4'>

                        {/* Email */}
                        <div>
                            <label className='block text-sm font-bold
                                text-indigo-700 mb-1.5'>
                                Email address
                            </label>
                            <input
                                type='email'
                                name='email'
                                value={form.email}
                                onChange={handleChange}
                                placeholder='your@email.com'
                                required
                                className='w-full border border-indigo-200 rounded-xl
                           px-4 py-2.5 text-sm text-indigo-900
                           placeholder-indigo-300 outline-none
                           focus:border-indigo-500 focus:ring-2
                           focus:ring-indigo-100 transition-all'
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className='flex items-center justify-between mb-1.5'>
                                <label className='text-sm font-bold text-indigo-700'>
                                    Password
                                </label>
                                <button
                                    type='button'
                                    className='text-xs text-indigo-400 hover:text-indigo-600'
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder='Enter your password'
                                    required
                                    className='w-full border border-indigo-200 rounded-xl
                             px-4 py-2.5 text-sm text-indigo-900
                             placeholder-indigo-300 outline-none
                             focus:border-indigo-500 focus:ring-2
                             focus:ring-indigo-100 transition-all pr-12'
                                />
                                {/* Show/hide password toggle */}
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3 top-1/2 -translate-y-1/2
                             text-indigo-400 hover:text-indigo-600
                             text-xs font-bold'
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-indigo-700 text-white py-3
                         rounded-xl font-bold text-sm
                         hover:bg-indigo-600 disabled:opacity-60
                         disabled:cursor-not-allowed
                         shadow-lg shadow-indigo-200
                         transition-all mt-2'
                        >
                            {loading ? (
                                <span className='flex items-center justify-center gap-2'>
                                    <span className='w-4 h-4 border-2 border-white
                                   border-t-transparent rounded-full
                                   animate-spin' />
                                    Logging in...
                                </span>
                            ) : (
                                'Login →'
                            )}
                        </button>

                    </form>

                    {/* Divider */}
                    <div className='my-5 flex items-center gap-3'>
                        <hr className='flex-1 border-indigo-100' />
                        <span className='text-xs text-indigo-300 font-semibold'>
                            or continue with
                        </span>
                        <hr className='flex-1 border-indigo-100' />
                    </div>

                    {/* Google OAuth button */}


                    <a
                        href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
                        className='flex items-center justify-center gap-3
                    w-full border-2 border-indigo-200 rounded-xl
                    py-2.5 text-sm font-semibold text-indigo-700
                    hover:bg-indigo-50 hover:border-indigo-300
                    transition-all'
                    >
                        {/* Google icon */}
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            className='w-5 h-5'
                        >
                            <path
                                fill='#4285F4'
                                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26
                   1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92
                   3.28-4.74 3.28-8.09z'
                            />
                            <path
                                fill='#34A853'
                                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23
                   1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99
                   20.53 7.7 23 12 23z'
                            />
                            <path
                                fill='#FBBC05'
                                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43
                   8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                            />
                            <path
                                fill='#EA4335'
                                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45
                   2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66
                   2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                            />
                        </svg>
                        Continue with Google
                    </a>

                    {/* Register link */}
                    <p className='text-center text-sm text-indigo-400 mt-6'>
                        Don't have an account?{' '}
                        <Link
                            to='/register'
                            className='text-indigo-700 font-bold hover:underline'
                        >
                            Sign up free
                        </Link>
                    </p>

                </div>

                {/* Trust note */}
                <p className='text-center text-xs text-indigo-400 mt-4'>
                    Protected by SSL encryption. Your data is safe with us.
                </p>

            </div>
        </div>
    );
}

export default Login
