import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/auth/authSlice'
import api from '../utils/axiosInstance'

const AuthCallback = () => {
    const [searchParams] = useSearchParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [status, setStatus] = useState('loading')
    const [message, setMessage] = useState('Signing you in...')

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get token from URL query param
                // URL looks like: /auth/callback?token=eyJhbGci...
                const token = searchParams.get('token')

                if (!token) {
                    setStatus('error')
                    setMessage('No token found. Please try logging in again.')
                    setTimeout(() => navigate('/login'), 3000)
                    return
                }

                // Save token to localStorage first
                // so axiosInstance can attach it to the next request
                localStorage.setItem('token', token)

                // Fetch user profile using the token
                const { data: user } = await api.get('/auth/me')

                // Save user to localStorage
                localStorage.setItem('user', JSON.stringify(user))

                // Update Redux state
                dispatch(setCredentials({ user, token }))

                setStatus('success')
                setMessage(`Welcome, ${user.name}! Redirecting...`)

                // Redirect based on role after short delay
                setTimeout(() => {
                    navigate(
                        user.role === 'teacher'
                            ? '/dashboard/teacher'
                            : '/dashboard/student',
                        { replace: true }
                    )
                }, 1500)

            } catch (err) {
                // Something went wrong — clear storage and redirect
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                setStatus('error')
                setMessage(
                    err.response?.data?.message ||
                    'Login failed. Please try again.'
                )
                setTimeout(() => navigate('/login'), 3000)
            }
        }

        handleCallback()
    }, [])

    return (
        <div className='min-h-screen bg-indigo-50 flex items-center
                    justify-center p-4 relative overflow-hidden'>

            {/* Background decoration */}
            <div className='absolute top-0 left-0 w-72 h-72 bg-indigo-200
                      rounded-full opacity-30
                      -translate-x-1/2 -translate-y-1/2' />
            <div className='absolute bottom-0 right-0 w-96 h-96 bg-purple-200
                      rounded-full opacity-20
                      translate-x-1/3 translate-y-1/3' />

            <div className='relative bg-white rounded-2xl border
                      border-indigo-100 shadow-xl shadow-indigo-100
                      p-12 w-full max-w-sm text-center'>

                {/* Logo */}
                <div className='text-2xl font-extrabold text-indigo-900
                        tracking-tight mb-8'>
                    Study<span className='text-emerald-500'>·</span>Space
                </div>

                {/* Loading state */}
                {status === 'loading' && (
                    <>
                        {/* Spinner */}
                        <div className='flex justify-center mb-6'>
                            <div className='w-14 h-14 rounded-full border-4
                              border-indigo-100 border-t-indigo-600
                              animate-spin' />
                        </div>
                        <h2 className='text-lg font-extrabold text-indigo-900 mb-2'>
                            Signing you in
                        </h2>
                        <p className='text-sm text-indigo-400'>
                            Please wait a moment...
                        </p>
                    </>
                )}

                {/* Success state */}
                {status === 'success' && (
                    <>
                        {/* Success icon */}
                        <div className='flex justify-center mb-6'>
                            <div className='w-14 h-14 rounded-full bg-emerald-100
                              border-2 border-emerald-300
                              flex items-center justify-center'>
                                <svg
                                    className='w-7 h-7 text-emerald-600'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M5 13l4 4L19 7'
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className='text-lg font-extrabold text-indigo-900 mb-2'>
                            Login successful!
                        </h2>
                        <p className='text-sm text-indigo-400'>
                            {message}
                        </p>

                        {/* Progress bar */}
                        <div className='mt-5 h-1.5 bg-indigo-100
                            rounded-full overflow-hidden'>
                            <div className='h-full bg-emerald-500 rounded-full
                              animate-[progress_1.5s_ease-in-out_forwards]
                              w-0' />
                        </div>
                    </>
                )}

                {/* Error state */}
                {status === 'error' && (
                    <>
                        {/* Error icon */}
                        <div className='flex justify-center mb-6'>
                            <div className='w-14 h-14 rounded-full bg-red-100
                              border-2 border-red-300
                              flex items-center justify-center'>
                                <svg
                                    className='w-7 h-7 text-red-500'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M6 18L18 6M6 6l12 12'
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className='text-lg font-extrabold text-indigo-900 mb-2'>
                            Login failed
                        </h2>
                        <p className='text-sm text-red-500 mb-5'>
                            {message}
                        </p>
                        <p className='text-xs text-indigo-400'>
                            Redirecting to login page...
                        </p>
                    </>
                )}

                {/* Manual redirect links */}
                <div className='mt-8 pt-6 border-t border-indigo-100'>
                    <p className='text-xs text-indigo-400 mb-3'>
                        Not redirecting automatically?
                    </p>
                    <div className='flex gap-3 justify-center'>
                        <button
                            onClick={() => navigate('/login')}
                            className='text-xs font-bold text-indigo-600
                         hover:underline'
                        >
                            Go to Login
                        </button>
                        <span className='text-indigo-200'>|</span>
                        <button
                            onClick={() => navigate('/')}
                            className='text-xs font-bold text-indigo-600
                         hover:underline'
                        >
                            Go to Home
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AuthCallback