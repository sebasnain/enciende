export type UserRole = 'member' | 'admin'

export interface UserStreak {
  current: number
  longest: number
  lastActiveDate: string | null
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  role: UserRole
  createdAt: number
  streak: UserStreak
}
