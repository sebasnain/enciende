import { useMemo, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { BibleBook, TranslationCode } from '@/types/bible'
import type { StudyHighlight } from '@/types/content'
import { buildSegments, parseVerseTokens, type HighlightRange } from '@/utils/studyText'
import { buildPassageRoute } from '@/utils/passage'
import { getSelectionOffsets } from '@/utils/textSelection'
import styles from './StudyParagraph.module.css'

interface StudyParagraphProps {
  paragraphIndex: number
  rawText: string
  books: BibleBook[]
  translation: TranslationCode
  highlights: StudyHighlight[]
  canHighlight: boolean
  onSelect: (paragraphIndex: number, start: number, end: number) => void
  onRemoveHighlight: (id: string) => void
}

export function StudyParagraph({
  paragraphIndex,
  rawText,
  books,
  translation,
  highlights,
  canHighlight,
  onSelect,
  onRemoveHighlight,
}: StudyParagraphProps) {
  const ref = useRef<HTMLParagraphElement>(null)

  const { display, tokens } = useMemo(() => parseVerseTokens(rawText, books), [rawText, books])

  const highlightRanges: HighlightRange[] = useMemo(
    () => highlights.map((h) => ({ id: h.id, start: h.start, end: h.end, color: h.color, style: h.style })),
    [highlights],
  )

  const segments = useMemo(() => buildSegments(display, tokens, highlightRanges), [display, tokens, highlightRanges])

  function handleSelectionEnd() {
    if (!canHighlight || !ref.current) return
    const offsets = getSelectionOffsets(ref.current)
    if (!offsets) return
    onSelect(paragraphIndex, offsets.start, offsets.end)
  }

  return (
    <p ref={ref} className={styles.paragraph} onMouseUp={handleSelectionEnd} onTouchEnd={handleSelectionEnd}>
      {segments.map((seg, i) => {
        let node = <span>{seg.text}</span>

        if (seg.highlight) {
          const isCircle = seg.highlight.style === 'circle'
          const style: CSSProperties = isCircle
            ? ({ '--circle-color': `var(--highlight-${seg.highlight.color})` } as CSSProperties)
            : { background: `var(--highlight-${seg.highlight.color})` }
          node = (
            <mark
              className={isCircle ? styles.circleMark : styles.fillMark}
              style={style}
              onClick={(e) => {
                e.stopPropagation()
                onRemoveHighlight(seg.highlight!.id)
              }}
            >
              {node}
            </mark>
          )
        }

        if (seg.token) {
          node = (
            <Link to={buildPassageRoute(seg.token.ref, translation)} className={styles.verseLink}>
              {node}
            </Link>
          )
        }

        return <span key={i}>{node}</span>
      })}
    </p>
  )
}
