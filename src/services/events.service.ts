import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { ChurchEvent } from '@/types/events'

const eventsRef = collection(db, 'events')

export async function listUpcomingEvents(): Promise<ChurchEvent[]> {
  const snap = await getDocs(query(eventsRef, orderBy('startAt', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChurchEvent)
}

export async function createEvent(event: Omit<ChurchEvent, 'id'>) {
  await addDoc(eventsRef, event)
}

export async function updateEvent(id: string, patch: Partial<ChurchEvent>) {
  await updateDoc(doc(eventsRef, id), patch)
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(eventsRef, id))
}

export async function getTodayEvent(): Promise<ChurchEvent | null> {
  const events = await listUpcomingEvents()
  const now = new Date()
  const todayEvent = events.find((event) => {
    const eventDate = new Date(event.startAt)
    return (
      Number.isFinite(event.startAt) &&
      eventDate.getFullYear() === now.getFullYear() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getDate() === now.getDate()
    )
  })
  return todayEvent ?? null
}
