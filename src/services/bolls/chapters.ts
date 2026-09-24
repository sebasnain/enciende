import { bollsFetch } from './client'
import type { BibleVerse, TranslationCode } from '@/types/bible'

/**
 * Fallback puntual para un solo capítulo cuando la traducción aún no está
 * descargada localmente. Nunca usar en loop sobre todos los capítulos/libros:
 * Bolls.life pide expresamente no scrapear la Biblia completa con este endpoint.
 */
export function getChapterText(translation: TranslationCode, bookId: number, chapter: number) {
  return bollsFetch<BibleVerse[]>(`/get-text/${translation}/${bookId}/${chapter}/`)
}
