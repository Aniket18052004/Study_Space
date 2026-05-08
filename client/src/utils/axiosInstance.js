import axios from 'axios'

// Create axios instance with base URL
// In development: baseURL = 'http://localhost:5000'
// In production: baseURL = 'https://study-space-server.onrender.com'
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    withCredentials: true,
    timeout: 10000,
})

// Automatically attaches JWT token to every request.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Handles expired tokens without hiding login/register form errors.
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const requestUrl = error.config?.url || ''
        const isAuthPage =
            window.location.pathname === '/login' ||
            window.location.pathname === '/register'
        const isAuthRequest =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/register')

        if (error.response?.status === 401 && !isAuthPage && !isAuthRequest) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default api
