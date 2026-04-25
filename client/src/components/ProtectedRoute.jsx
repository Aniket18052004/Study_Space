import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ role }) => {
    const { user, token } = useSelector(s => s.auth)

    // Not logged in at all — redirect to login
    if (!token || !user) {
        return <Navigate to='/login' replace />
    }

    // Logged in but wrong role — redirect to home
    if (role && user.role !== role) {
        return <Navigate to='/' replace />
    }

    // All good — render the child page
    return <Outlet />
}

export default ProtectedRoute
