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
