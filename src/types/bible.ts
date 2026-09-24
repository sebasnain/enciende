export type TranslationCode = 'NVI' | 'RV1960'

export interface BibleBook {
  bookid: number
  name: string
  chapters: number
}

export interface BibleVerse {
  pk: number
  book?: number
  chapter?: number
  verse: number
  text: string
}

export interface CachedTranslation {
  translation: TranslationCode
  verses: BibleVerse[]
  downloadedAt: number
}

export interface DictionaryEntry {
  topic: string
  definition: string
  lexeme?: string
  transliteration?: string
}

export type HighlightColor = 'amarillo' | 'verde' | 'celeste' | 'rosa' | 'lila'

export interface VerseHighlight {
  id: string
  translation: TranslationCode
  book: number
  chapter: number
  verse: number
  color: HighlightColor | null
  note: string | null
  updatedAt: number
}
