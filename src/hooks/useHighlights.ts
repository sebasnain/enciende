import { useEffect, useRef, useState } from 'react'
import { commitVerseHighlights, getChapterHighlights, getChapterNotes, setVerseNote, verseHighlightId } from '@/services/highlights.service'
import { applyPaint, type PaintTool } from '@/utils/paint'
import type { TranslationCode, VerseHighlight } from '@/types/bible'

export interface VersePaintRange {
  verse: number
  start: number
  end: number
}

export function useHighlights(uid: string | null, translation: TranslationCode, book: number, chapter: number) {
  const [highlights, setHighlights] = useState<VerseHighlight[]>([])
  const [notes, setNotes] = useState<Record<number, string>>({})
  const highlightsRef = useRef<VerseHighlight[]>([])

  function replaceHighlights(next: VerseHighlight[]) {
    highlightsRef.current = next
    setHighlights(next)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!uid) {
        replaceHighlights([])
        setNotes({})
        return
      }
      const [highlightResult, noteResult] = await Promise.all([
        getChapterHighlights(uid, translation, book, chapter),
        getChapterNotes(uid, translation, book, chapter),
      ])
      if (cancelled) return
      replaceHighlights(highlightResult)
      setNotes(Object.fromEntries(noteResult.map((n) => [n.verse, n.note])))
    }
    load()
    return () => {
      cancelled = true
    }
  }, [uid, translation, book, chapter])

  /** Applies one marker stroke (possibly spanning several verses). Updates the screen
   * immediately and persists in the background. tool = null erases. */
  async function paint(ranges: VersePaintRange[], tool: PaintTool | null) {
    if (!uid || ranges.length === 0) return
    let next = highlightsRef.current
    const removeIds: string[] = []
    const added: VerseHighlight[] = []

    for (const r of ranges) {
      const inVerse = next.filter((h) => h.verse === r.verse)
      const { remove, add } = applyPaint(inVerse, r.start, r.end, tool)
      const created = add.map((p) => ({
        id: verseHighlightId(translation, book, chapter, r.verse, p.start, p.end),
        translation,
        book,
        chapter,
        verse: r.verse,
        ...p,
        updatedAt: Date.now(),
      }))
      const dropped = new Set([...remove, ...created.map((c) => c.id)])
      next = [...next.filter((h) => !dropped.has(h.id)), ...created]
      removeIds.push(...remove)
      added.push(...created)
    }

    replaceHighlights(next)
    await commitVerseHighlights(uid, removeIds, added)
  }

  async function setNote(verse: number, note: string) {
    if (!uid) return
    setNotes((prev) => ({ ...prev, [verse]: note }))
    await setVerseNote(uid, translation, book, chapter, verse, note)
  }

  return { highlights, notes, paint, setNote }
}
