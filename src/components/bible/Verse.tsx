import type { CSSProperties } from 'react'
import type { VerseHighlight } from '@/types/bible'
import { Icon } from '@/components/ui/Icon'
import styles from './Verse.module.css'

interface VerseProps {
  number: number
  html: string
  highlight?: VerseHighlight
  selected: boolean
  onSelectVerse: () => void
  onSelectWord: (word: string) => void
}

function toPlainWords(html: string): string[] {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.split(' ')
}

export function Verse({ number, html, highlight, selected, onSelectVerse, onSelectWord }: VerseProps) {
  const words = toPlainWords(html)
  const isCircle = highlight?.style === 'circle' && !!highlight.color
  const background = !isCircle && highlight?.color ? `var(--highlight-${highlight.color})` : undefined
  const circleColor = isCircle ? `var(--highlight-${highlight!.color})` : undefined

  return (
    <p
      id={`verse-${number}`}
      className={`${styles.verse} ${selected ? styles.selected : ''} ${isCircle ? styles.circled : ''}`}
      style={{ background, '--circle-color': circleColor } as CSSProperties}
    >
      <button className={styles.number} onClick={onSelectVerse} aria-label={`Seleccionar versículo ${number}`}>
        {number}
      </button>
      {words.map((word, i) => (
        <span key={i}>
          <span
            className={styles.word}
            onClick={(e) => {
              e.stopPropagation()
              onSelectWord(word.replace(/[.,;:!?"'()]/g, ''))
            }}
          >
            {word}
          </span>{' '}
        </span>
      ))}
      {highlight?.note && (
        <span title={highlight.note}>
          <Icon name="sticky-fill" className={styles.noteBadge} />
        </span>
      )}
    </p>
  )
}
