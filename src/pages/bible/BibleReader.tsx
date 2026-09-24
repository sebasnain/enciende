import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useBiblePosition } from '@/context/BibleContext'
import { useBibleChapter } from '@/hooks/useBibleChapter'
import { useHighlights } from '@/hooks/useHighlights'
import { useBooks } from '@/hooks/useBooks'
import { VersionSwitcher } from '@/components/bible/VersionSwitcher'
import { ChapterNavigator } from '@/components/bible/ChapterNavigator'
import { VerseList } from '@/components/bible/VerseList'
import { VerseActionMenu } from '@/components/bible/VerseActionMenu'
import { NoteEditorModal } from '@/components/bible/NoteEditorModal'
import { DictionaryPopover } from '@/components/bible/DictionaryPopover'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import type { TranslationCode } from '@/types/bible'
import styles from './BibleReader.module.css'

export function BibleReader() {
  const { translation, bookId, chapter } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setPosition } = useBiblePosition()

  const t = (translation as TranslationCode) ?? 'NVI'
  const b = Number(bookId)
  const c = Number(chapter)

  const books = useBooks(t)
  const { verses, loading, error, cached, downloading, download } = useBibleChapter(t, b, c)
  const { highlights, setColor, setNote } = useHighlights(user?.uid ?? null, t, b, c)

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [noteVerse, setNoteVerse] = useState<number | null>(null)
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null)

  function goTo(nextBook: number, nextChapter: number, nextTranslation: TranslationCode = t) {
    setPosition({ translation: nextTranslation, book: nextBook, chapter: nextChapter })
    navigate(`/biblia/${nextTranslation}/${nextBook}/${nextChapter}`)
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
          selectedVerse={selectedVerse}
          onSelectVerse={(v) => setSelectedVerse(selectedVerse === v ? null : v)}
          onSelectWord={(word) => setDictionaryWord(word)}
        />
      )}

      {selectedVerse !== null && (
        <VerseActionMenu
          verse={selectedVerse}
          color={highlights[selectedVerse]?.color ?? null}
          onColorChange={(color) => setColor(selectedVerse, color)}
          onOpenNote={() => setNoteVerse(selectedVerse)}
          onClose={() => setSelectedVerse(null)}
        />
      )}

      {noteVerse !== null && (
        <NoteEditorModal
          verse={noteVerse}
          initialNote={highlights[noteVerse]?.note ?? ''}
          onSave={(note) => setNote(noteVerse, note)}
          onClose={() => setNoteVerse(null)}
        />
      )}

      {dictionaryWord && <DictionaryPopover word={dictionaryWord} onClose={() => setDictionaryWord(null)} />}
    </div>
  )
}
