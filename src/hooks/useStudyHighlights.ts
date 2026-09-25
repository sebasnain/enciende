import { useEffect, useRef, useState } from 'react'
import { commitStudyHighlights, getStudyHighlights, studyHighlightId } from '@/services/studyHighlights.service'
import { applyPaint, type PaintTool } from '@/utils/paint'
import type { StudyHighlight } from '@/types/content'

export interface StudyPaintRange {
  lessonId: string
  paragraphIndex: number
  start: number
  end: number
}

export function useStudyHighlights(uid: string | null, lessonIds: string[]) {
  const [highlights, setHighlights] = useState<StudyHighlight[]>([])
  const highlightsRef = useRef<StudyHighlight[]>([])
  const idsKey = lessonIds.join(',')

  function replaceHighlights(next: StudyHighlight[]) {
    highlightsRef.current = next
    setHighlights(next)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!uid || lessonIds.length === 0) {
        replaceHighlights([])
        return
      }
      const result = await getStudyHighlights(uid, lessonIds)
      if (!cancelled) replaceHighlights(result)
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, idsKey])

  /** Applies one marker stroke (possibly spanning several paragraphs). Updates the screen
   * immediately and persists in the background. tool = null erases. */
  async function paint(ranges: StudyPaintRange[], tool: PaintTool | null) {
    if (!uid || ranges.length === 0) return
    let next = highlightsRef.current
    const removeIds: string[] = []
    const added: StudyHighlight[] = []

    for (const r of ranges) {
      const inParagraph = next.filter((h) => h.lessonId === r.lessonId && h.paragraphIndex === r.paragraphIndex)
      const { remove, add } = applyPaint(inParagraph, r.start, r.end, tool)
      const created = add.map((p) => ({
        id: studyHighlightId(r.lessonId, r.paragraphIndex, p.start, p.end),
        lessonId: r.lessonId,
        paragraphIndex: r.paragraphIndex,
        ...p,
        updatedAt: Date.now(),
      }))
      const dropped = new Set([...remove, ...created.map((c) => c.id)])
      next = [...next.filter((h) => !dropped.has(h.id)), ...created]
      removeIds.push(...remove)
      added.push(...created)
    }

    replaceHighlights(next)
    await commitStudyHighlights(uid, removeIds, added)
  }

  return { highlights, paint }
}
