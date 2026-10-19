import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <main className="auth-loading">Loading Karobaar...</main>
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
