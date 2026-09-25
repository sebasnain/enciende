export type TranslationCode = 'NVI' | 'RV1960' | 'RV2004' | 'NTV' | 'LBLA' | 'PDT' | 'BTX3'

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
export type HighlightStyle = 'fill' | 'pencil'

export interface VerseHighlight {
  id: string
  translation: TranslationCode
  book: number
  chapter: number
  verse: number
  start: number
  end: number
  color: HighlightColor
  style: HighlightStyle
  updatedAt: number
}

export interface VerseNote {
  id: string
  translation: TranslationCode
  book: number
  chapter: number
  verse: number
  note: string
  updatedAt: number
}
