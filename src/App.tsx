import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { BibleProvider } from '@/context/BibleContext'
import { router } from './router'

export function App() {
  return (
    <AuthProvider>
      <BibleProvider>
        <RouterProvider router={router} />
      </BibleProvider>
    </AuthProvider>
  )
}
