import { memo, useMemo, useState } from 'react'
import type { VerseHighlight } from '@/types/bible'
import { buildSegments, type HighlightRange } from '@/utils/studyText'
import { markProps } from '@/components/shared/marks'
import { Icon } from '@/components/ui/Icon'
import styles from './Verse.module.css'

interface VerseProps {
  number: number
  html: string
  highlights: VerseHighlight[]
  note?: string
  onOpenNote: (verse: number) => void
}

function toPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const FOOTNOTE = /(\[\d+\])/

// Footnote markers like "[12]" (NVI) point to notes the API doesn't provide. They're hidden
// with CSS rather than stripped, so the verse's text — and every saved highlight offset
// measured against it — stays exactly the same.
function renderText(text: string) {
  if (!FOOTNOTE.test(text)) return text
  return text.split(FOOTNOTE).map((part, i) =>
    FOOTNOTE.test(part) ? (
      <span key={i} className={styles.footnote}>
        {part}
      </span>
    ) : (
      part
    ),
  )
}

function VerseComponent({ number, html, highlights, note, onOpenNote }: VerseProps) {
  const [noteOpen, setNoteOpen] = useState(false)

  const display = useMemo(() => toPlainText(html), [html])
  const segments = useMemo(() => {
    const ranges: HighlightRange[] = highlights.map((h) => ({ id: h.id, start: h.start, end: h.end, color: h.color, style: h.style }))
    return buildSegments(display, [], ranges)
  }, [display, highlights])

  return (
    <p id={`verse-${number}`} className={styles.verse} data-unit-key={String(number)} data-unit-order={number}>
      <button type="button" className={styles.number} onClick={() => onOpenNote(number)} aria-label={`Nota del versículo ${number}`}>
        {number}
      </button>
      <span data-unit-text>
        {segments.map((seg, i) =>
          seg.highlight ? (
            <mark key={i} {...markProps(seg.highlight.color, seg.highlight.style)}>
              {renderText(seg.text)}
            </mark>
          ) : (
            <span key={i}>{renderText(seg.text)}</span>
          ),
        )}
      </span>
      {note && (
        <span className={styles.noteWrap}>
          <button
            type="button"
            className={`${styles.noteBadge} ${noteOpen ? styles.noteBadgeActive : ''}`}
            onClick={() => setNoteOpen((o) => !o)}
            aria-label="Ver nota"
          >
            <Icon name="flag-fill" />
          </button>
          {noteOpen && <span className={styles.notePopover}>{note}</span>}
        </span>
      )}
    </p>
  )
}

// Highlight objects keep their identity across strokes, so an element-wise comparison lets a
// stroke re-render only the verses it actually touched.
function sameProps(a: VerseProps, b: VerseProps) {
  return (
    a.number === b.number &&
    a.html === b.html &&
    a.note === b.note &&
    a.onOpenNote === b.onOpenNote &&
    a.highlights.length === b.highlights.length &&
    a.highlights.every((h, i) => h === b.highlights[i])
  )
}

export const Verse = memo(VerseComponent, sameProps)
