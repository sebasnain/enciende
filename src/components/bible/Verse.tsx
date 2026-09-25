import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { VerseHighlight } from '@/types/bible'
import { buildSegments, type HighlightRange } from '@/utils/studyText'
import { getSelectionOffsets } from '@/utils/textSelection'
import { Icon } from '@/components/ui/Icon'
import styles from './Verse.module.css'

interface VerseProps {
  number: number
  html: string
  highlights: VerseHighlight[]
  note?: string
  onOpenNote: () => void
  onSelect: (verse: number, start: number, end: number) => void
  onRemoveHighlight: (id: string) => void
  onSelectWord: (word: string) => void
}

function toPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function renderWords(text: string, onSelectWord?: (word: string) => void): ReactNode {
  if (!onSelectWord) return text
  return text.split(/(\s+)/).map((chunk, i) => {
    if (chunk === '' || /^\s+$/.test(chunk)) return chunk
    return (
      <span
        key={i}
        className={styles.word}
        onClick={(e) => {
          e.stopPropagation()
          onSelectWord(chunk.replace(/[.,;:!?"'()]/g, ''))
        }}
      >
        {chunk}
      </span>
    )
  })
}

export function Verse({ number, html, highlights, note, onOpenNote, onSelect, onRemoveHighlight, onSelectWord }: VerseProps) {
  const [noteOpen, setNoteOpen] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)

  const display = useMemo(() => toPlainText(html), [html])
  const highlightRanges: HighlightRange[] = useMemo(
    () => highlights.map((h) => ({ id: h.id, start: h.start, end: h.end, color: h.color, style: h.style })),
    [highlights],
  )
  const segments = useMemo(() => buildSegments(display, [], highlightRanges), [display, highlightRanges])

  function handleSelectionEnd() {
    if (!textRef.current) return
    const offsets = getSelectionOffsets(textRef.current)
    if (!offsets) return
    onSelect(number, offsets.start, offsets.end)
  }

  return (
    <p id={`verse-${number}`} className={styles.verse} onMouseUp={handleSelectionEnd} onTouchEnd={handleSelectionEnd}>
      <button
        type="button"
        className={styles.number}
        onClick={(e) => {
          e.stopPropagation()
          onOpenNote()
        }}
        aria-label={`Nota del versículo ${number}`}
      >
        {number}
      </button>
      <span ref={textRef}>
        {segments.map((seg, i) => {
          if (!seg.highlight) return <span key={i}>{renderWords(seg.text, onSelectWord)}</span>

          const isCircle = seg.highlight.style === 'circle'
          const markStyle: CSSProperties = isCircle
            ? ({ '--circle-color': `var(--highlight-${seg.highlight.color})` } as CSSProperties)
            : { background: `var(--highlight-${seg.highlight.color})` }

          return (
            <mark
              key={i}
              className={isCircle ? styles.circleMark : styles.fillMark}
              style={markStyle}
              title="Tocá para quitar el resaltado"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveHighlight(seg.highlight!.id)
              }}
            >
              {renderWords(seg.text)}
            </mark>
          )
        })}
      </span>
      {note && (
        <span className={styles.noteWrap}>
          <button
            type="button"
            className={`${styles.noteBadge} ${noteOpen ? styles.noteBadgeActive : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setNoteOpen((o) => !o)
            }}
            aria-label="Ver nota"
          >
            <Icon name="flag-fill" />
          </button>
          {noteOpen && (
            <span className={styles.notePopover} onClick={(e) => e.stopPropagation()}>
              {note}
            </span>
          )}
        </span>
      )}
    </p>
  )
}
