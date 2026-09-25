import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useBiblePosition } from '@/context/BibleContext'
import { useBibleChapter } from '@/hooks/useBibleChapter'
import { useHighlights } from '@/hooks/useHighlights'
import { useBooks } from '@/hooks/useBooks'
import { VersionSwitcher } from '@/components/bible/VersionSwitcher'
import { ChapterNavigator } from '@/components/bible/ChapterNavigator'
import { VerseList } from '@/components/bible/VerseList'
import { NoteEditorModal } from '@/components/bible/NoteEditorModal'
import { DictionaryPopover } from '@/components/bible/DictionaryPopover'
import { MarkerLayer, type MarkedRange } from '@/components/shared/MarkerLayer'
import { DEFAULT_MARKER_TOOL, MarkerToolbar, paintToolOf, previewNameOf } from '@/components/shared/MarkerToolbar'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import type { TranslationCode } from '@/types/bible'
import styles from './BibleReader.module.css'

export function BibleReader() {
  const { translation, bookId, chapter } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setPosition } = useBiblePosition()

  const t = (translation as TranslationCode) ?? 'NVI'
  const b = Number(bookId)
  const c = Number(chapter)
  const targetVerse = Number(searchParams.get('v')) || null

  const books = useBooks(t)
  const { verses, loading, error, cached, downloading, download } = useBibleChapter(t, b, c)
  const { highlights, notes, paint, setNote } = useHighlights(user?.uid ?? null, t, b, c)

  const [markerActive, setMarkerActive] = useState(false)
  const [tool, setTool] = useState(DEFAULT_MARKER_TOOL)
  const [noteVerse, setNoteVerse] = useState<number | null>(null)
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !targetVerse) return
    document.getElementById(`verse-${targetVerse}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, targetVerse, b, c])

  function goTo(nextBook: number, nextChapter: number, nextTranslation: TranslationCode = t) {
    setPosition({ translation: nextTranslation, book: nextBook, chapter: nextChapter })
    navigate(`/biblia/${nextTranslation}/${nextBook}/${nextChapter}`)
  }

  function handlePaint(ranges: MarkedRange[]) {
    paint(
      ranges.map((r) => ({ verse: Number(r.unitKey), start: r.start, end: r.end })),
      paintToolOf(tool),
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <ChapterNavigator books={books} bookId={b} chapter={c} onNavigate={goTo} />
        <VersionSwitcher value={t} onChange={(next) => goTo(b, c, next)} />
      </div>

      {!cached && !loading && (
        <div className={styles.downloadBar}>
          <span>Descarga {t} para leer sin conexión y evitar cargar de nuevo cada capítulo.</span>
          <Button variant="secondary" onClick={download} disabled={downloading}>
            {downloading ? 'Descargando…' : 'Descargar'}
          </Button>
        </div>
      )}

      {loading && <Spinner />}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <MarkerLayer active={markerActive} previewName={previewNameOf(tool)} onPaint={handlePaint}>
          <VerseList verses={verses} highlights={highlights} notes={notes} onOpenNote={setNoteVerse} onLookupWord={setDictionaryWord} />
        </MarkerLayer>
      )}

      {user && <MarkerToolbar active={markerActive} tool={tool} onActiveChange={setMarkerActive} onToolChange={setTool} />}

      {noteVerse !== null && (
        <NoteEditorModal
          verse={noteVerse}
          initialNote={notes[noteVerse] ?? ''}
          onSave={(note) => setNote(noteVerse, note)}
          onClose={() => setNoteVerse(null)}
        />
      )}

      {dictionaryWord && <DictionaryPopover word={dictionaryWord} onClose={() => setDictionaryWord(null)} />}
    </div>
  )
}
