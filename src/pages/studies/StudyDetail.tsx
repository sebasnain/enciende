import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { studiesService } from '@/services/content.service'
import { listLessons } from '@/services/lessons.service'
import type { Study, StudyLesson } from '@/types/content'
import { useAuth } from '@/context/AuthContext'
import { useBiblePosition } from '@/context/BibleContext'
import { useBooks } from '@/hooks/useBooks'
import { useStudyHighlights } from '@/hooks/useStudyHighlights'
import { splitParagraphs } from '@/utils/studyText'
import { StudyParagraph } from '@/components/studies/StudyParagraph'
import { MarkerLayer, type MarkedRange } from '@/components/shared/MarkerLayer'
import { DEFAULT_MARKER_TOOL, MarkerToolbar, paintToolOf, previewNameOf } from '@/components/shared/MarkerToolbar'
import { MarkdownView } from '@/components/ui/MarkdownView'
import { Spinner } from '@/components/ui/Spinner'

const KEY_SEPARATOR = '::'

export function StudyDetail() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { position } = useBiblePosition()
  const [item, setItem] = useState<Study | null>(null)
  const [lessons, setLessons] = useState<StudyLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [markerActive, setMarkerActive] = useState(false)
  const [tool, setTool] = useState(DEFAULT_MARKER_TOOL)

  const books = useBooks('NVI')
  const { highlights, paint } = useStudyHighlights(
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

  function handlePaint(ranges: MarkedRange[]) {
    paint(
      ranges.map((r) => {
        const [lessonId, paragraph] = r.unitKey.split(KEY_SEPARATOR)
        return { lessonId, paragraphIndex: Number(paragraph), start: r.start, end: r.end }
      }),
      paintToolOf(tool),
    )
  }

  let order = 0

  return (
    <article style={{ paddingBottom: 96 }}>
      <h1>{item.title}</h1>
      <p style={{ color: 'var(--color-ink-400)' }}>{item.authorName}</p>
      {item.body && <MarkdownView content={item.body} />}

      <MarkerLayer active={markerActive} previewName={previewNameOf(tool)} onPaint={handlePaint}>
        {lessons.map((lesson) => (
          <div key={lesson.id} style={{ marginTop: 32 }}>
            <h2>{lesson.title}</h2>
            {splitParagraphs(lesson.body).map((paragraph, idx) => (
              <StudyParagraph
                key={idx}
                unitKey={`${lesson.id}${KEY_SEPARATOR}${idx}`}
                unitOrder={order++}
                rawText={paragraph}
                books={books}
                translation={position.translation}
                highlights={highlights.filter((h) => h.lessonId === lesson.id && h.paragraphIndex === idx)}
              />
            ))}
          </div>
        ))}
      </MarkerLayer>

      {user && lessons.length > 0 && (
        <MarkerToolbar active={markerActive} tool={tool} onActiveChange={setMarkerActive} onToolChange={setTool} />
      )}
    </article>
  )
}
