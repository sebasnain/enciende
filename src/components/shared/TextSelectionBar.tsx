import { useState } from 'react'
import type { HighlightColor, HighlightStyle } from '@/types/bible'
import { HighlightColorPicker } from '@/components/bible/HighlightColorPicker'
import { Icon } from '@/components/ui/Icon'
import styles from './TextSelectionBar.module.css'

interface TextSelectionBarProps {
  selectedText?: string
  onPick: (color: HighlightColor, style: HighlightStyle) => void
  onClose: () => void
  /** Only passed where a dictionary lookup makes sense (the Bible reader). Shown only when
   * the current selection is a single word, since lexicon lookups don't work on phrases. */
  onLookupWord?: (word: string) => void
}

/** Color/style picker for a free-text selection. Shared by the Bible reader and Studies so
 * highlighting behaves identically in both places. */
export function TextSelectionBar({ selectedText, onPick, onClose, onLookupWord }: TextSelectionBarProps) {
  const [style, setStyle] = useState<HighlightStyle>('fill')
  const trimmed = selectedText?.trim() ?? ''
  const isSingleWord = trimmed !== '' && !/\s/.test(trimmed)

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Resaltar</span>
      <HighlightColorPicker
        color={null}
        style={style}
        onStyleChange={setStyle}
        onSelect={(color) => {
          if (color) onPick(color, style)
        }}
      />
      {onLookupWord && isSingleWord && (
        <button className={styles.dictionaryButton} onClick={() => onLookupWord(trimmed)} aria-label="Buscar en el diccionario">
          <Icon name="journal-text" />
        </button>
      )}
      <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
        <Icon name="x-lg" />
      </button>
    </div>
  )
}
