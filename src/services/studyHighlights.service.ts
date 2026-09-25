import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { StudyHighlight } from '@/types/content'
import type { HighlightColor, HighlightStyle } from '@/types/bible'

function highlightsRef(uid: string) {
  return collection(db, 'users', uid, 'studyHighlights')
}

function highlightId(lessonId: string, paragraphIndex: number, start: number, end: number) {
  return `${lessonId}_${paragraphIndex}_${start}_${end}`
}

export async function getStudyHighlights(uid: string, lessonIds: string[]): Promise<StudyHighlight[]> {
  if (lessonIds.length === 0) return []
  const q = query(highlightsRef(uid), where('lessonId', 'in', lessonIds.slice(0, 30)))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyHighlight)
}

export async function addStudyHighlight(
  uid: string,
  lessonId: string,
  paragraphIndex: number,
  start: number,
  end: number,
  color: HighlightColor,
  style: HighlightStyle,
): Promise<StudyHighlight> {
  const id = highlightId(lessonId, paragraphIndex, start, end)
  await setDoc(doc(highlightsRef(uid), id), {
    lessonId,
    paragraphIndex,
    start,
    end,
    color,
    style,
    updatedAt: serverTimestamp(),
  })
  return { id, lessonId, paragraphIndex, start, end, color, style, updatedAt: Date.now() }
}

export async function removeStudyHighlight(uid: string, id: string) {
  await deleteDoc(doc(highlightsRef(uid), id))
}
