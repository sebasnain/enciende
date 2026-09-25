import { useEffect, useState } from 'react'
import { addStudyHighlight, getStudyHighlights, removeStudyHighlight } from '@/services/studyHighlights.service'
import type { StudyHighlight } from '@/types/content'
import type { HighlightColor, HighlightStyle } from '@/types/bible'

export function useStudyHighlights(uid: string | null, lessonIds: string[]) {
  const [highlights, setHighlights] = useState<StudyHighlight[]>([])

  async function reload() {
    if (!uid || lessonIds.length === 0) {
      setHighlights([])
      return
    }
    setHighlights(await getStudyHighlights(uid, lessonIds))
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, lessonIds.join(',')])

  async function addHighlight(lessonId: string, paragraphIndex: number, start: number, end: number, color: HighlightColor, style: HighlightStyle) {
    if (!uid) return
    const created = await addStudyHighlight(uid, lessonId, paragraphIndex, start, end, color, style)
    setHighlights((prev) => [...prev.filter((h) => h.id !== created.id), created])
  }

  async function removeHighlight(id: string) {
    if (!uid) return
    setHighlights((prev) => prev.filter((h) => h.id !== id))
    await removeStudyHighlight(uid, id)
  }

  return { highlights, addHighlight, removeHighlight }
}
