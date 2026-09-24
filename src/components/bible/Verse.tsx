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
  const background = highlight?.color ? `var(--highlight-${highlight.color})` : undefined

  return (
    <p className={`${styles.verse} ${selected ? styles.selected : ''}`} style={{ background }}>
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
