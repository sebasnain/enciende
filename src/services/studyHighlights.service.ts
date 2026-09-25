import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { StudyHighlight } from '@/types/content'

function highlightsRef(uid: string) {
  return collection(db, 'users', uid, 'studyHighlights')
}

export function studyHighlightId(lessonId: string, paragraphIndex: number, start: number, end: number) {
  return `${lessonId}_${paragraphIndex}_${start}_${end}`
}

export async function getStudyHighlights(uid: string, lessonIds: string[]): Promise<StudyHighlight[]> {
  if (lessonIds.length === 0) return []
  const q = query(highlightsRef(uid), where('lessonId', 'in', lessonIds.slice(0, 30)))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyHighlight)
}

/** Applies a stroke's removals and additions in one atomic write. */
export async function commitStudyHighlights(uid: string, removeIds: string[], add: StudyHighlight[]) {
  const batch = writeBatch(db)
  for (const id of removeIds) batch.delete(doc(highlightsRef(uid), id))
  for (const h of add) {
    const { id, ...data } = h
    batch.set(doc(highlightsRef(uid), id), { ...data, updatedAt: serverTimestamp() })
  }
  await batch.commit()
}
