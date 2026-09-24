import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { UserProfile } from '@/types/user'
import type { User } from 'firebase/auth'

function userRef(uid: string) {
  return doc(db, 'users', uid)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const existing = await getUserProfile(user.uid)
  if (existing) return existing

  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName ?? 'Miembro',
    email: user.email ?? '',
    photoURL: user.photoURL,
    role: 'member',
    createdAt: Date.now(),
    streak: { current: 0, longest: 0, lastActiveDate: null },
  }
  await setDoc(userRef(user.uid), profile)
  return profile
}
