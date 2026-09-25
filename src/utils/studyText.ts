import type { BibleBook, HighlightColor, HighlightStyle } from '@/types/bible'
import type { PassageRef } from '@/types/plans'

export interface VerseToken {
  start: number
  end: number
  ref: PassageRef
  label: string
}

const TOKEN_REGEX = /\[\[([^\]]+)\]\]/g
const REF_REGEX = /^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/

export function splitParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function parseReference(text: string, books: BibleBook[]): PassageRef | null {
  const match = text.trim().match(REF_REGEX)
  if (!match) return null
  const [, bookName, chapter, verseStart, verseEnd] = match
  const book = books.find((b) => b.name.toLowerCase() === bookName.trim().toLowerCase())
  if (!book) return null
  return {
    book: book.bookid,
    bookName: book.name,
    chapter: Number(chapter),
    ...(verseStart ? { verseStart: Number(verseStart) } : {}),
    ...(verseEnd ? { verseEnd: Number(verseEnd) } : {}),
  }
}

/** Replaces [[Libro Cap:Vers]] tokens with their plain label and returns the resulting
 * display string plus the character ranges (in display-string coordinates) that should
 * link to that passage. */
export function parseVerseTokens(raw: string, books: BibleBook[]): { display: string; tokens: VerseToken[] } {
  if (books.length === 0) return { display: raw.replace(TOKEN_REGEX, '$1'), tokens: [] }

  let display = ''
  let lastIndex = 0
  const tokens: VerseToken[] = []

  for (const match of raw.matchAll(TOKEN_REGEX)) {
    const inner = match[1]
    const idx = match.index ?? 0
    display += raw.slice(lastIndex, idx)
    const label = inner.trim()
    const ref = parseReference(inner, books)
    const start = display.length
    display += label
    const end = display.length
    if (ref) tokens.push({ start, end, ref, label })
    lastIndex = idx + match[0].length
  }
  display += raw.slice(lastIndex)

  return { display, tokens }
}

export interface HighlightRange {
  id: string
  start: number
  end: number
  color: HighlightColor
  style: HighlightStyle
}

export interface TextSegment {
  start: number
  end: number
  text: string
  token?: VerseToken
  highlight?: HighlightRange
}

/** Merges verse-link tokens and user highlights (both given as character ranges over
 * `display`) into a flat, non-overlapping list of renderable segments. */
export function buildSegments(display: string, tokens: VerseToken[], highlights: HighlightRange[]): TextSegment[] {
  if (!display) return []

  const boundaries = new Set<number>([0, display.length])
  for (const t of tokens) {
    boundaries.add(t.start)
    boundaries.add(t.end)
  }
  for (const h of highlights) {
    boundaries.add(Math.max(0, h.start))
    boundaries.add(Math.min(display.length, h.end))
  }
  const points = [...boundaries].sort((a, b) => a - b)

  const segments: TextSegment[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    if (end <= start) continue
    const token = tokens.find((t) => t.start <= start && t.end >= end)
    const highlight = highlights.find((h) => h.start <= start && h.end >= end)
    segments.push({ start, end, text: display.slice(start, end), token, highlight })
  }
  return segments
}
