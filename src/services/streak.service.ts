import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { UserStreak } from '@/types/user'

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

export function computeNextStreak(streak: UserStreak, now = new Date()): UserStreak | null {
  const today = todayKey(now)
  if (streak.lastActiveDate === today) return null

  const nextCurrent = !streak.lastActiveDate || daysBetween(streak.lastActiveDate, today) > 1
    ? 1
    : streak.current + 1

  return {
    current: nextCurrent,
    longest: Math.max(streak.longest, nextCurrent),
    lastActiveDate: today,
  }
}

export async function touchStreak(uid: string, currentStreak: UserStreak): Promise<UserStreak | null> {
  const next = computeNextStreak(currentStreak)
  if (!next) return null
  await updateDoc(doc(db, 'users', uid), { streak: next })
  return next
}
