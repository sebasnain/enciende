import { collection, doc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { TranslationCode, VerseHighlight, VerseNote } from '@/types/bible'

function highlightsRef(uid: string) {
  return collection(db, 'users', uid, 'highlights')
}

function notesRef(uid: string) {
  return collection(db, 'users', uid, 'verseNotes')
}

export function verseHighlightId(translation: TranslationCode, book: number, chapter: number, verse: number, start: number, end: number) {
  return `${translation}_${book}_${chapter}_${verse}_${start}_${end}`
}

function noteId(translation: TranslationCode, book: number, chapter: number, verse: number) {
  return `${translation}_${book}_${chapter}_${verse}`
}

export async function getChapterHighlights(
  uid: string,
  translation: TranslationCode,
  book: number,
  chapter: number,
): Promise<VerseHighlight[]> {
  const q = query(
    highlightsRef(uid),
    where('translation', '==', translation),
    where('book', '==', book),
    where('chapter', '==', chapter),
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as VerseHighlight)
    .filter((h) => typeof h.start === 'number' && typeof h.end === 'number' && !!h.color)
}

/** Applies a stroke's removals and additions in one atomic write. */
export async function commitVerseHighlights(uid: string, removeIds: string[], add: VerseHighlight[]) {
  const batch = writeBatch(db)
  for (const id of removeIds) batch.delete(doc(highlightsRef(uid), id))
  for (const h of add) {
    const { id, ...data } = h
    batch.set(doc(highlightsRef(uid), id), { ...data, updatedAt: serverTimestamp() })
  }
  await batch.commit()
}

export async function getChapterNotes(
  uid: string,
  translation: TranslationCode,
  book: number,
  chapter: number,
): Promise<VerseNote[]> {
  const q = query(notesRef(uid), where('translation', '==', translation), where('book', '==', book), where('chapter', '==', chapter))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as VerseNote)
}

export async function setVerseNote(
  uid: string,
  translation: TranslationCode,
  book: number,
  chapter: number,
  verse: number,
  note: string,
) {
  const id = noteId(translation, book, chapter, verse)
  await setDoc(doc(notesRef(uid), id), { translation, book, chapter, verse, note, updatedAt: serverTimestamp() }, { merge: true })
}
