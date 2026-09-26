import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import { Spinner } from '@/components/ui/Spinner'
import { Home } from '@/pages/Home'
import { Welcome } from '@/pages/auth/Welcome'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
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
import { CommunityLibraryList } from '@/pages/communityLibrary/CommunityLibraryList'
import { CommunityLibraryDetail } from '@/pages/communityLibrary/CommunityLibraryDetail'
import { MyLoans } from '@/pages/communityLibrary/MyLoans'
import { Profile } from '@/pages/profile/Profile'

// El panel de admin carga las librerías de escaneo de códigos (QR/ISBN) de la biblioteca comunitaria, que pesan
// bastante; se separa en su propio chunk para que los miembros no las descarguen si nunca entran a /admin.
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))

export const router = createBrowserRouter([
  { path: '/bienvenida', element: <Welcome /> },
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/recuperar', element: <ForgotPassword /> },
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
      { path: '/biblioteca', element: <CommunityLibraryList /> },
      {
        path: '/biblioteca/mis-prestamos',
        element: (
          <ProtectedRoute>
            <MyLoans />
          </ProtectedRoute>
        ),
      },
      { path: '/biblioteca/:titleId', element: <CommunityLibraryDetail /> },
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
          <AdminRoute roles={['admin', 'bibliotecario']}>
            <Suspense fallback={<Spinner />}>
              <AdminDashboard />
            </Suspense>
          </AdminRoute>
        ),
      },
    ],
  },
])
