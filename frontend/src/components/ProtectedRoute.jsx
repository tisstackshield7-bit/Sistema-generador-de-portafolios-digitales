import { useAuthStore } from '../context/authStore'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }) {
  const { token } = useAuthStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
