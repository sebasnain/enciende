import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { BibleIndexRedirect } from '@/pages/bible/BibleIndexRedirect'
import { BibleReader } from '@/pages/bible/BibleReader'
import { PlanList } from '@/pages/plans/PlanList'
import { PlanDetail } from '@/pages/plans/PlanDetail'
import { DevotionalList } from '@/pages/devotionals/DevotionalList'
import { DevotionalDetail } from '@/pages/devotionals/DevotionalDetail'
import { StudyList } from '@/pages/studies/StudyList'
import { StudyDetail } from '@/pages/studies/StudyDetail'
import { Schedule } from '@/pages/schedule/Schedule'
import { Library } from '@/pages/library/Library'
import { Profile } from '@/pages/profile/Profile'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/biblia', element: <BibleIndexRedirect /> },
      { path: '/biblia/:translation/:bookId/:chapter', element: <BibleReader /> },
      { path: '/planes', element: <PlanList /> },
      { path: '/planes/:planId', element: <PlanDetail /> },
      { path: '/devocionales', element: <DevotionalList /> },
      { path: '/devocionales/:id', element: <DevotionalDetail /> },
      { path: '/estudios', element: <StudyList /> },
      { path: '/estudios/:id', element: <StudyDetail /> },
      { path: '/cronograma', element: <Schedule /> },
      { path: '/libreria', element: <Library /> },
      {
        path: '/perfil',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
    ],
  },
])
