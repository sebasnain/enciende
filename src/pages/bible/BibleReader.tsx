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
import { TextSelectionBar } from '@/components/shared/TextSelectionBar'
import { NoteEditorModal } from '@/components/bible/NoteEditorModal'
import { DictionaryPopover } from '@/components/bible/DictionaryPopover'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import type { HighlightColor, HighlightStyle, TranslationCode } from '@/types/bible'
import styles from './BibleReader.module.css'

interface PendingSelection {
  verse: number
  start: number
  end: number
  text: string
}

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
  const { highlights, notes, addHighlight, removeHighlight, setNote } = useHighlights(user?.uid ?? null, t, b, c)

  useEffect(() => {
    if (loading || !targetVerse) return
    document.getElementById(`verse-${targetVerse}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, targetVerse, b, c])

  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null)
  const [noteVerse, setNoteVerse] = useState<number | null>(null)
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null)

  function goTo(nextBook: number, nextChapter: number, nextTranslation: TranslationCode = t) {
    setPosition({ translation: nextTranslation, book: nextBook, chapter: nextChapter })
    navigate(`/biblia/${nextTranslation}/${nextBook}/${nextChapter}`)
  }

  function handlePick(color: HighlightColor, style: HighlightStyle) {
    if (!pendingSelection) return
    addHighlight(pendingSelection.verse, pendingSelection.start, pendingSelection.end, color, style)
    window.getSelection()?.removeAllRanges()
    setPendingSelection(null)
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
        <VerseList
          verses={verses}
          highlights={highlights}
          notes={notes}
          onSelect={(verse, start, end, text) => setPendingSelection({ verse, start, end, text })}
          onRemoveHighlight={removeHighlight}
          onOpenNote={setNoteVerse}
          onLookupWord={(word) => setDictionaryWord(word)}
        />
      )}

      {pendingSelection && (
        <TextSelectionBar
          selectedText={pendingSelection.text}
          onPick={handlePick}
          onClose={() => setPendingSelection(null)}
          onLookupWord={(word) => setDictionaryWord(word)}
        />
      )}

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
