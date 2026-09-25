import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { StudyLesson } from '@/types/content'

function lessonsRef(studyId: string) {
  return collection(db, 'studies', studyId, 'lessons')
}

export async function listLessons(studyId: string): Promise<StudyLesson[]> {
  const snap = await getDocs(query(lessonsRef(studyId), orderBy('order')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyLesson)
}

export async function setLesson(studyId: string, order: number, data: Omit<StudyLesson, 'id' | 'order'>) {
  await setDoc(doc(lessonsRef(studyId), String(order)), { ...data, order })
}

export async function deleteLesson(studyId: string, order: number) {
  await deleteDoc(doc(lessonsRef(studyId), String(order)))
}
