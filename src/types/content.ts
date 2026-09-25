import type { HighlightColor, HighlightStyle } from './bible'

export interface Devotional {
  id: string
  title: string
  body: string
  authorId: string
  authorName: string
  coverImage: string | null
  publishedAt: number
  tags: string[]
}

export interface Study {
  id: string
  title: string
  body: string
  authorId: string
  authorName: string
  coverImage: string | null
  publishedAt: number
  series: string | null
}

export interface StudyLesson {
  id: string
  order: number
  title: string
  /** Plain text. Bible references are embedded as [[Libro Capítulo:Versículo]] tokens. */
  body: string
}

export interface StudyHighlight {
  id: string
  lessonId: string
  paragraphIndex: number
  start: number
  end: number
  color: HighlightColor
  style: HighlightStyle
  updatedAt: number
}
