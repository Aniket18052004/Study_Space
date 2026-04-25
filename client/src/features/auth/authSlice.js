import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axiosInstance'

// ─────────────────────────────────────────────
// Async thunk — Login user
// ─────────────────────────────────────────────
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/auth/login', credentials)

            // Save token and user to localStorage
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            return data
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Login failed. Please try again.'
            )
        }
    }
)

// ─────────────────────────────────────────────
// Async thunk — Register user
// ─────────────────────────────────────────────
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            // Validate all fields on client side before sending
            if (!userData.name?.trim()) {
                return rejectWithValue('Name is required')
            }
            if (!userData.email?.trim()) {
                return rejectWithValue('Email is required')
            }
            if (!userData.password || userData.password.length < 6) {
                return rejectWithValue('Password must be at least 6 characters')
            }
            if (!['student', 'teacher'].includes(userData.role)) {
                return rejectWithValue('Please select a valid role')
            }

            const { data } = await api.post('/auth/register', userData)

            // Save token and user to localStorage
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            return data
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Registration failed. Please try again.'
            )
        }
    }
)

// ─────────────────────────────────────────────
// Async thunk — Get current user profile
// ─────────────────────────────────────────────
export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/auth/me')
            return data
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to fetch user.'
            )
        }
    }
)

// ─────────────────────────────────────────────
// Auth slice
// ─────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',

    initialState: {
        // Load from localStorage so user stays logged in on refresh
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
    },

    reducers: {
        // ── Logout ─────────────────────────────────
        logout: (state) => {
            state.user = null
            state.token = null
            state.error = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },

        // ── Set credentials (Google OAuth) ─────────
        // Called from AuthCallback page after Google login
        setCredentials: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.error = null
        },

        // ── Clear error ────────────────────────────
        clearError: (state) => {
            state.error = null
        },

        // ── Update user profile locally ────────────
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload }
            localStorage.setItem('user', JSON.stringify(state.user))
        },
    },

    extraReducers: (builder) => {
        // ── Login cases ────────────────────────────
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.token = action.payload.token
                state.error = null
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

        // ── Register cases ─────────────────────────
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.token = action.payload.token
                state.error = null
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

        // ── FetchMe cases ──────────────────────────
        builder
            .addCase(fetchMe.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                localStorage.setItem('user', JSON.stringify(action.payload))
            })
            .addCase(fetchMe.rejected, (state) => {
                state.loading = false
            })
    },
})

export const {
    logout,
    setCredentials,
    clearError,
    updateUser,
} = authSlice.actions

export default authSlice.reducer