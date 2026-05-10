import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from '../features/auth/authSlice'

const Register = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, loading, error } = useSelector(s => s.auth)

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [confirmError, setConfirmError] = useState('')

    // If already logged in — redirect away
    useEffect(() => {
        if (user) {
            navigate(
                user.role === 'teacher'
                    ? '/dashboard/teacher'
                    : '/dashboard/student'
            )
        }
    }, [user, navigate])

    // Clear errors on mount
    useEffect(() => {
        dispatch(clearError())
    }, [dispatch])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setConfirmError('')

        // Check passwords match
        if (form.password !== confirmPassword) {
            setConfirmError('Passwords do not match.')
            return
        }

        // Check password length
        if (form.password.length < 6) {
            setConfirmError('Password must be at least 6 characters.')
            return
        }

        const result = await dispatch(registerUser(form))

        if (registerUser.fulfilled.match(result)) {
            const role = result.payload.user.role
            navigate(
                role === 'teacher'
                    ? '/dashboard/teacher'
                    : '/dashboard/student'
            )
        }
    }

    return (
        <div className='min-h-screen bg-indigo-50 flex items-center justify-center p-4 relative overflow-hidden'>

            {/* Background decoration */}
            <div className='absolute top-0 right-0 w-72 h-72 bg-indigo-200
                      rounded-full opacity-30 translate-x-1/2 -translate-y-1/2' />
            <div className='absolute bottom-0 left-0 w-96 h-96 bg-emerald-100
                      rounded-full opacity-20 -translate-x-1/3 translate-y-1/3' />

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
                            Create your account
                        </h1>
                        <p className='text-sm text-indigo-400'>
                            Join StudySpace today — it's free
                        </p>
                    </div>

                    {/* Role selector */}
                    <div className='grid grid-cols-2 gap-3 mb-6'>
                        {[
                            {
                                value: 'student',
                                label: 'I am a Student',
                                desc: 'Browse and enroll in courses',
                                icon: '🎓',
                            },
                            {
                                value: 'teacher',
                                label: 'I am a Teacher',
                                desc: 'Create and sell courses',
                                icon: '👨‍🏫',
                            },
                        ].map(({ value, label, desc, icon }) => (
                            <button
                                key={value}
                                type='button'
                                onClick={() => setForm({ ...form, role: value })}
                                className={`p-4 rounded-xl border-2 text-left
                            transition-all
                            ${form.role === value
                                        ? value === 'student'
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-amber-500 bg-amber-50'
                                        : 'border-indigo-100 hover:border-indigo-200'
                                    }`}
                            >
                                <div className='text-xl mb-1'>{icon}</div>
                                <div className={`text-sm font-bold
                  ${form.role === value
                                        ? value === 'student'
                                            ? 'text-indigo-800'
                                            : 'text-amber-800'
                                        : 'text-indigo-700'
                                    }`}>
                                    {label}
                                </div>
                                <div className='text-xs text-indigo-400 mt-0.5'>
                                    {desc}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Backend error */}
                    {error && (
                        <div className='bg-red-50 border border-red-200
                            text-red-700 text-sm rounded-xl
                            p-3 mb-5 flex items-start gap-2'>
                            <span className='text-red-500 mt-0.5'>⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Confirm password error */}
                    {confirmError && (
                        <div className='bg-red-50 border border-red-200
                            text-red-700 text-sm rounded-xl
                            p-3 mb-5 flex items-start gap-2'>
                            <span className='text-red-500 mt-0.5'>⚠</span>
                            <span>{confirmError}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className='space-y-4'>

                        {/* Full name */}
                        <div>
                            <label className='block text-sm font-bold
                                text-indigo-700 mb-1.5'>
                                Full name
                            </label>
                            <input
                                type='text'
                                name='name'
                                value={form.name}
                                onChange={handleChange}
                                placeholder='Your full name'
                                required
                                className='w-full border border-indigo-200 rounded-xl
                           px-4 py-2.5 text-sm text-indigo-900
                           placeholder-indigo-300 outline-none
                           focus:border-indigo-500 focus:ring-2
                           focus:ring-indigo-100 transition-all'
                            />
                        </div>

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
                            <label className='block text-sm font-bold
                                text-indigo-700 mb-1.5'>
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder='Min 6 characters'
                                    required
                                    className='w-full border border-indigo-200 rounded-xl
                             px-4 py-2.5 text-sm text-indigo-900
                             placeholder-indigo-300 outline-none
                             focus:border-indigo-500 focus:ring-2
                             focus:ring-indigo-100 transition-all pr-12'
                                />
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

                            {/* Password strength indicator */}
                            {form.password.length > 0 && (
                                <div className='mt-2'>
                                    <div className='flex gap-1'>
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all
                          ${form.password.length >= i * 3
                                                        ? form.password.length < 6
                                                            ? 'bg-red-400'
                                                            : form.password.length < 10
                                                                ? 'bg-amber-400'
                                                                : 'bg-emerald-500'
                                                        : 'bg-indigo-100'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs mt-1
                    ${form.password.length < 6
                                            ? 'text-red-500'
                                            : form.password.length < 10
                                                ? 'text-amber-500'
                                                : 'text-emerald-600'
                                        }`}>
                                        {form.password.length < 6
                                            ? 'Too short'
                                            : form.password.length < 10
                                                ? 'Good password'
                                                : 'Strong password'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className='block text-sm font-bold
                                text-indigo-700 mb-1.5'>
                                Confirm password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder='Re-enter your password'
                                required
                                className={`w-full border rounded-xl px-4 py-2.5
                           text-sm text-indigo-900 placeholder-indigo-300
                           outline-none focus:ring-2 transition-all
                           ${confirmPassword && form.password !== confirmPassword
                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                        : confirmPassword && form.password === confirmPassword
                                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                                            : 'border-indigo-200 focus:border-indigo-500 focus:ring-indigo-100'
                                    }`}
                            />
                            {/* Match indicator */}
                            {confirmPassword && (
                                <p className={`text-xs mt-1
                  ${form.password === confirmPassword
                                        ? 'text-emerald-600'
                                        : 'text-red-500'
                                    }`}>
                                    {form.password === confirmPassword
                                        ? '✓ Passwords match'
                                        : '✗ Passwords do not match'
                                    }
                                </p>
                            )}
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
                                    Creating account...
                                </span>
                            ) : (
                                `Create ${form.role === 'teacher' ? 'Teacher' : 'Student'} Account →`
                            )}
                        </button>

                    </form>

                    {/* Divider */}
                    <div className='my-5 flex items-center gap-3'>
                        <hr className='flex-1 border-indigo-100' />
                        <span className='text-xs text-indigo-300 font-semibold'>
                            or
                        </span>
                        <hr className='flex-1 border-indigo-100' />
                    </div>

                    {/* Google OAuth */}
                    <a
                        href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
                        className='flex items-center justify-center gap-3 w-full border-2 border-indigo-200 rounded-xl py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all'
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            className='w-5 h-5'
                        >
                            <path
                                fill='#4285F4'
                                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                            />
                            <path
                                fill='#34A853'
                                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                            />
                            <path
                                fill='#FBBC05'
                                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                            />
                            <path
                                fill='#EA4335'
                                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                            />
                        </svg>
                        Continue with Google
                    </a>

                    {/* Terms note */}
                    <p className='text-center text-xs text-indigo-300 mt-4'>
                        By creating an account you agree to our{' '}
                        <a href='#' className='text-indigo-500 hover:underline'>
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href='#' className='text-indigo-500 hover:underline'>
                            Privacy Policy
                        </a>
                    </p>

                    {/* Login link */}
                    <p className='text-center text-sm text-indigo-400 mt-4'>
                        Already have an account?{' '}
                        <Link
                            to='/login'
                            className='text-indigo-700 font-bold hover:underline'
                        >
                            Login here
                        </Link>
                    </p>

                    {/* Trust note */}
                    <p className='text-center text-xs text-indigo-400 mt-4'>
                        Protected by SSL encryption. Your data is safe with us.
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Register