import { useEffect, useState } from 'react'
import { addVerseHighlight, getChapterHighlights, getChapterNotes, removeVerseHighlight, setVerseNote } from '@/services/highlights.service'
import type { HighlightColor, HighlightStyle, TranslationCode, VerseHighlight } from '@/types/bible'

export function useHighlights(uid: string | null, translation: TranslationCode, book: number, chapter: number) {
  const [highlights, setHighlights] = useState<VerseHighlight[]>([])
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)

  async function reload() {
    if (!uid) {
      setHighlights([])
      setNotes({})
      return
    }
    setLoading(true)
    const [highlightResult, noteResult] = await Promise.all([
      getChapterHighlights(uid, translation, book, chapter),
      getChapterNotes(uid, translation, book, chapter),
    ])
    setHighlights(highlightResult)
    setNotes(Object.fromEntries(noteResult.map((n) => [n.verse, n.note])))
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, translation, book, chapter])

  async function addHighlight(verse: number, start: number, end: number, color: HighlightColor, style: HighlightStyle) {
    if (!uid) return
    const created = await addVerseHighlight(uid, translation, book, chapter, verse, start, end, color, style)
    setHighlights((prev) => [...prev.filter((h) => h.id !== created.id), created])
  }

  async function removeHighlight(id: string) {
    if (!uid) return
    setHighlights((prev) => prev.filter((h) => h.id !== id))
    await removeVerseHighlight(uid, id)
  }

  async function setNote(verse: number, note: string) {
    if (!uid) return
    setNotes((prev) => ({ ...prev, [verse]: note }))
    await setVerseNote(uid, translation, book, chapter, verse, note)
  }

  return { highlights, notes, loading, addHighlight, removeHighlight, setNote }
}
