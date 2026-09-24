import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { HighlightColor, HighlightStyle, TranslationCode, VerseHighlight } from '@/types/bible'

function highlightId(translation: TranslationCode, book: number, chapter: number, verse: number) {
  return `${translation}_${book}_${chapter}_${verse}`
}

function highlightsRef(uid: string) {
  return collection(db, 'users', uid, 'highlights')
}

export async function getChapterHighlights(
  uid: string,
  translation: TranslationCode,
  book: number,
  chapter: number,
): Promise<Record<number, VerseHighlight>> {
  const q = query(
    highlightsRef(uid),
    where('translation', '==', translation),
    where('book', '==', book),
    where('chapter', '==', chapter),
  )
  const snap = await getDocs(q)
  const byVerse: Record<number, VerseHighlight> = {}
  snap.forEach((docSnap) => {
    const data = docSnap.data()
    byVerse[data.verse as number] = { id: docSnap.id, ...data } as VerseHighlight
  })
  return byVerse
}

export async function setVerseHighlight(
  uid: string,
  translation: TranslationCode,
  book: number,
  chapter: number,
  verse: number,
  color: HighlightColor | null,
  style: HighlightStyle | null,
) {
  const id = highlightId(translation, book, chapter, verse)
  await setDoc(
    doc(highlightsRef(uid), id),
    { translation, book, chapter, verse, color, style, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function setVerseNote(
  uid: string,
  translation: TranslationCode,
  book: number,
  chapter: number,
  verse: number,
  note: string,
) {
  const id = highlightId(translation, book, chapter, verse)
  await setDoc(
    doc(highlightsRef(uid), id),
    { translation, book, chapter, verse, note, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
