import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { UserProfile } from '@/types/user'
import type { LibraryMembership } from '@/types/library'
import type { User } from 'firebase/auth'

function userRef(uid: string) {
  return doc(db, 'users', uid)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

/** Para buscar miembros desde el panel de biblioteca (bibliotecario/admin); las reglas de Firestore lo restringen a esos roles. */
export async function listAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => d.data() as UserProfile)
}

/** El bibliotecario solo puede tocar este campo del perfil de otro usuario (reforzado también en firestore.rules). */
export async function setLibraryMembership(uid: string, membership: LibraryMembership) {
  await updateDoc(userRef(uid), { libraryMembership: membership })
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
