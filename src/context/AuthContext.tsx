import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { ensureUserProfile } from '@/services/users.service'
import { touchStreak } from '@/services/streak.service'
import type { UserProfile } from '@/types/user'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(authUser: User) {
    const userProfile = await ensureUserProfile(authUser)
    const advancedStreak = await touchStreak(authUser.uid, userProfile.streak)
    setProfile(advancedStreak ? { ...userProfile, streak: advancedStreak } : userProfile)
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser)
      if (authUser) {
        await loadProfile(authUser)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  async function refreshProfile() {
    if (user) await loadProfile(user)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
