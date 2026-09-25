import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { BibleBook, TranslationCode } from '@/types/bible'
import type { StudyHighlight } from '@/types/content'
import { buildSegments, parseVerseTokens, type HighlightRange } from '@/utils/studyText'
import { buildPassageRoute } from '@/utils/passage'
import { markProps } from '@/components/shared/marks'
import styles from './StudyParagraph.module.css'

interface StudyParagraphProps {
  unitKey: string
  unitOrder: number
  rawText: string
  books: BibleBook[]
  translation: TranslationCode
  highlights: StudyHighlight[]
}

export function StudyParagraph({ unitKey, unitOrder, rawText, books, translation, highlights }: StudyParagraphProps) {
  const { display, tokens } = useMemo(() => parseVerseTokens(rawText, books), [rawText, books])

  const segments = useMemo(() => {
    const ranges: HighlightRange[] = highlights.map((h) => ({ id: h.id, start: h.start, end: h.end, color: h.color, style: h.style }))
    return buildSegments(display, tokens, ranges)
  }, [display, tokens, highlights])

  return (
    <p className={styles.paragraph} data-unit-key={unitKey} data-unit-order={unitOrder} data-unit-text>
      {segments.map((seg, i) => {
        let node: ReactNode = seg.text
        if (seg.token) {
          node = (
            <Link to={buildPassageRoute(seg.token.ref, translation)} className={styles.verseLink}>
              {node}
            </Link>
          )
        }
        if (seg.highlight) {
          node = <mark {...markProps(seg.highlight.color, seg.highlight.style)}>{node}</mark>
        }
        return <span key={i}>{node}</span>
      })}
    </p>
  )
}
