import type { PassageRef } from '@/types/plans'
import type { TranslationCode } from '@/types/bible'

export function buildPassageRoute(ref: PassageRef, translation: TranslationCode): string {
  const path = `/biblia/${translation}/${ref.book}/${ref.chapter}`
  return ref.verseStart ? `${path}?v=${ref.verseStart}` : path
}

export function formatPassageRef(ref: PassageRef): string {
  const base = `${ref.bookName || 'Libro'} ${ref.chapter}`
  if (!ref.verseStart) return base
  if (!ref.verseEnd || ref.verseEnd === ref.verseStart) return `${base}:${ref.verseStart}`
  return `${base}:${ref.verseStart}-${ref.verseEnd}`
}

export function formatPassageRefs(refs: PassageRef[]): string {
  return refs.map(formatPassageRef).join('; ')
}
