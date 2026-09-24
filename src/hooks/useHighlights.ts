import { useEffect, useState } from 'react'
import { getChapterHighlights, setVerseHighlight, setVerseNote } from '@/services/highlights.service'
import type { HighlightColor, HighlightStyle, TranslationCode, VerseHighlight } from '@/types/bible'

export function useHighlights(
  uid: string | null,
  translation: TranslationCode,
  book: number,
  chapter: number,
) {
  const [highlights, setHighlights] = useState<Record<number, VerseHighlight>>({})
  const [loading, setLoading] = useState(false)

  async function reload() {
    if (!uid) {
      setHighlights({})
      return
    }
    setLoading(true)
    const result = await getChapterHighlights(uid, translation, book, chapter)
    setHighlights(result)
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, translation, book, chapter])

  async function setColor(verse: number, color: HighlightColor | null, style: HighlightStyle = 'fill') {
    if (!uid) return
    const appliedStyle = color ? style : null
    setHighlights((prev) => ({
      ...prev,
      [verse]: {
        ...(prev[verse] ?? { id: '', note: null }),
        translation,
        book,
        chapter,
        verse,
        color,
        style: appliedStyle,
        updatedAt: Date.now(),
      } as VerseHighlight,
    }))
    await setVerseHighlight(uid, translation, book, chapter, verse, color, appliedStyle)
  }

  async function setNote(verse: number, note: string) {
    if (!uid) return
    setHighlights((prev) => ({
      ...prev,
      [verse]: { ...(prev[verse] ?? { id: '', color: null }), translation, book, chapter, verse, note, updatedAt: Date.now() } as VerseHighlight,
    }))
    await setVerseNote(uid, translation, book, chapter, verse, note)
  }

  return { highlights, loading, setColor, setNote }
}
