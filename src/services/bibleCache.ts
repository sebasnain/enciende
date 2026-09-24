import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { bollsStaticUrl } from './bolls/client'
import { getBooks as fetchBooks } from './bolls/translations'
import type { BibleBook, BibleVerse, TranslationCode } from '@/types/bible'

interface EncienceBibleDB extends DBSchema {
  translations: {
    key: TranslationCode
    value: { translation: TranslationCode; verses: BibleVerse[]; downloadedAt: number }
  }
  books: {
    key: TranslationCode
    value: { translation: TranslationCode; books: BibleBook[] }
  }
}

let dbPromise: Promise<IDBPDatabase<EncienceBibleDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<EncienceBibleDB>('enciende-bible', 1, {
      upgrade(db) {
        db.createObjectStore('translations', { keyPath: 'translation' })
        db.createObjectStore('books', { keyPath: 'translation' })
      },
    })
  }
  return dbPromise
}

export async function isTranslationCached(translation: TranslationCode): Promise<boolean> {
  const db = await getDb()
  const entry = await db.get('translations', translation)
  return !!entry
}

export async function downloadTranslation(translation: TranslationCode): Promise<void> {
  const [verses, books] = await Promise.all([
    fetch(bollsStaticUrl.translationDump(translation)).then((res) => {
      if (!res.ok) throw new Error(`No se pudo descargar ${translation}`)
      return res.json() as Promise<BibleVerse[]>
    }),
    fetchBooks(translation),
  ])
  const db = await getDb()
  const tx = db.transaction(['translations', 'books'], 'readwrite')
  await Promise.all([
    tx.objectStore('translations').put({ translation, verses, downloadedAt: Date.now() }),
    tx.objectStore('books').put({ translation, books }),
    tx.done,
  ])
}

export async function getBooksFromCache(translation: TranslationCode): Promise<BibleBook[] | null> {
  const db = await getDb()
  const entry = await db.get('books', translation)
  return entry?.books ?? null
}

export async function getChapterFromCache(
  translation: TranslationCode,
  bookId: number,
  chapter: number,
): Promise<BibleVerse[] | null> {
  const db = await getDb()
  const entry = await db.get('translations', translation)
  if (!entry) return null
  return entry.verses.filter((v) => v.book === bookId && v.chapter === chapter)
}

export async function listCachedTranslations(): Promise<TranslationCode[]> {
  const db = await getDb()
  const keys = await db.getAllKeys('translations')
  return keys
}
