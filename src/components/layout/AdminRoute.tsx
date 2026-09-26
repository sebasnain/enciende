import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/Spinner'
import type { UserRole } from '@/types/user'

interface AdminRouteProps {
  children: ReactNode
  roles?: UserRole[]
}

export function AdminRoute({ children, roles = ['admin'] }: AdminRouteProps) {
  const { profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (!profile || !roles.includes(profile.role)) return <Navigate to="/" replace />
  return <>{children}</>
}
