import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Devotional, Study } from '@/types/content'

function makeCrud<T extends { id: string }>(collectionName: string) {
  const ref = collection(db, collectionName)

  return {
    async list(): Promise<T[]> {
      const snap = await getDocs(query(ref, orderBy('publishedAt', 'desc')))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
    },
    async get(id: string): Promise<T | null> {
      const snap = await getDoc(doc(ref, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
    },
    async create(data: Omit<T, 'id' | 'publishedAt'>): Promise<string> {
      const docRef = await addDoc(ref, { ...data, publishedAt: serverTimestamp() })
      return docRef.id
    },
    async update(id: string, patch: Partial<T>) {
      await updateDoc(doc(ref, id), patch as DocumentData)
    },
    async remove(id: string) {
      await deleteDoc(doc(ref, id))
    },
  }
}

export const devotionalsService = makeCrud<Devotional>('devotionals')
export const studiesService = makeCrud<Study>('studies')
