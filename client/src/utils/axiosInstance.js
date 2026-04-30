import axios from 'axios'

// Create axios instance with base URL
// In development: baseURL = 'http://localhost:5000'
// In production: baseURL = 'https://study-space-server.onrender.com'
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    withCredentials: true, // Important for sending cookies with requests
})

// ── Request interceptor ───────────────────────────────────────
// Automatically attaches JWT token to every request
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

// ── Response interceptor ──────────────────────────────────────
// Handles expired token globally — redirects to login
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // If token expired or invalid — clear storage and redirect
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api