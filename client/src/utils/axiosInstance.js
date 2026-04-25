import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
    baseURL: '/api',
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