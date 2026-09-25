import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { HighlightColor, HighlightStyle, TranslationCode, VerseHighlight, VerseNote } from '@/types/bible'

function highlightsRef(uid: string) {
  return collection(db, 'users', uid, 'highlights')
}

function notesRef(uid: string) {
  return collection(db, 'users', uid, 'verseNotes')
}

function highlightId(translation: TranslationCode, book: number, chapter: number, verse: number, start: number, end: number) {
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
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as VerseHighlight)
}

export async function addVerseHighlight(
  uid: string,
  translation: TranslationCode,
  book: number,
  chapter: number,
  verse: number,
  start: number,
  end: number,
  color: HighlightColor,
  style: HighlightStyle,
): Promise<VerseHighlight> {
  const id = highlightId(translation, book, chapter, verse, start, end)
  await setDoc(doc(highlightsRef(uid), id), {
    translation,
    book,
    chapter,
    verse,
    start,
    end,
    color,
    style,
    updatedAt: serverTimestamp(),
  })
  return { id, translation, book, chapter, verse, start, end, color, style, updatedAt: Date.now() }
}

export async function removeVerseHighlight(uid: string, id: string) {
  await deleteDoc(doc(highlightsRef(uid), id))
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
