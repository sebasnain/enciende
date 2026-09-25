import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { studiesService } from '@/services/content.service'
import { listLessons } from '@/services/lessons.service'
import type { Study, StudyLesson } from '@/types/content'
import type { HighlightColor, HighlightStyle } from '@/types/bible'
import { useAuth } from '@/context/AuthContext'
import { useBiblePosition } from '@/context/BibleContext'
import { useBooks } from '@/hooks/useBooks'
import { useStudyHighlights } from '@/hooks/useStudyHighlights'
import { splitParagraphs } from '@/utils/studyText'
import { StudyParagraph } from '@/components/studies/StudyParagraph'
import { TextSelectionBar } from '@/components/shared/TextSelectionBar'
import { MarkdownView } from '@/components/ui/MarkdownView'
import { Spinner } from '@/components/ui/Spinner'

interface PendingSelection {
  lessonId: string
  paragraphIndex: number
  start: number
  end: number
}

export function StudyDetail() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { position } = useBiblePosition()
  const [item, setItem] = useState<Study | null>(null)
  const [lessons, setLessons] = useState<StudyLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null)

  const books = useBooks('NVI')
  const { highlights, addHighlight, removeHighlight } = useStudyHighlights(
    user?.uid ?? null,
    lessons.map((l) => l.id),
  )

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [studyData, lessonData] = await Promise.all([studiesService.get(id), listLessons(id)])
        setItem(studyData)
        setLessons(lessonData)
      } catch {
        setItem(null)
        setLessons([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <Spinner />
  if (!item) return <p>Estudio no encontrado.</p>

  function handlePick(color: HighlightColor, style: HighlightStyle) {
    if (!pendingSelection) return
    addHighlight(pendingSelection.lessonId, pendingSelection.paragraphIndex, pendingSelection.start, pendingSelection.end, color, style)
    window.getSelection()?.removeAllRanges()
    setPendingSelection(null)
  }

  return (
    <article>
      <h1>{item.title}</h1>
      <p style={{ color: 'var(--color-ink-400)' }}>{item.authorName}</p>
      {item.body && <MarkdownView content={item.body} />}

      {lessons.map((lesson) => (
        <div key={lesson.id} style={{ marginTop: 32 }}>
          <h2>{lesson.title}</h2>
          {splitParagraphs(lesson.body).map((paragraph, idx) => (
            <StudyParagraph
              key={idx}
              paragraphIndex={idx}
              rawText={paragraph}
              books={books}
              translation={position.translation}
              highlights={highlights.filter((h) => h.lessonId === lesson.id && h.paragraphIndex === idx)}
              canHighlight={!!user}
              onSelect={(paragraphIndex, start, end) => setPendingSelection({ lessonId: lesson.id, paragraphIndex, start, end })}
              onRemoveHighlight={removeHighlight}
            />
          ))}
        </div>
      ))}

      {pendingSelection && <TextSelectionBar onPick={handlePick} onClose={() => setPendingSelection(null)} />}
    </article>
  )
}
