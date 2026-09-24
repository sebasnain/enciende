import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { LiveSettings, SocialSettings } from '@/types/products'

const DEFAULT_LIVE: LiveSettings = {
  scheduleDay: 0,
  scheduleHour: 19,
  scheduleMinute: 0,
  durationMinutes: 120,
  channelUrl: '',
  manualActive: false,
  manualVideoId: null,
}

export async function getLiveSettings(): Promise<LiveSettings> {
  const snap = await getDoc(doc(db, 'settings', 'live'))
  return snap.exists() ? { ...DEFAULT_LIVE, ...(snap.data() as LiveSettings) } : DEFAULT_LIVE
}

export async function setLiveSettings(patch: Partial<LiveSettings>) {
  await setDoc(doc(db, 'settings', 'live'), patch, { merge: true })
}

export function isLiveNow(settings: LiveSettings, now = new Date()): boolean {
  if (settings.manualActive) return true
  if (now.getDay() !== settings.scheduleDay) return false
  const startMinutes = settings.scheduleHour * 60 + settings.scheduleMinute
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= startMinutes && nowMinutes < startMinutes + settings.durationMinutes
}

export async function getSocialSettings(): Promise<SocialSettings | null> {
  const snap = await getDoc(doc(db, 'settings', 'social'))
  return snap.exists() ? (snap.data() as SocialSettings) : null
}

export async function setSocialSettings(patch: Partial<SocialSettings>) {
  await setDoc(doc(db, 'settings', 'social'), patch, { merge: true })
}
