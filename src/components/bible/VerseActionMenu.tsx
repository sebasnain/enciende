import type { HighlightColor, HighlightStyle } from '@/types/bible'
import { HighlightColorPicker } from './HighlightColorPicker'
import { Icon } from '@/components/ui/Icon'
import styles from './VerseActionMenu.module.css'

interface VerseActionMenuProps {
  verse: number
  color: HighlightColor | null
  highlightStyle: HighlightStyle
  onColorChange: (color: HighlightColor | null) => void
  onStyleChange: (style: HighlightStyle) => void
  onOpenNote: () => void
  onClose: () => void
}

export function VerseActionMenu({
  verse,
  color,
  highlightStyle,
  onColorChange,
  onStyleChange,
  onOpenNote,
  onClose,
}: VerseActionMenuProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>Versículo {verse}</span>
      <HighlightColorPicker color={color} style={highlightStyle} onSelect={onColorChange} onStyleChange={onStyleChange} />
      <button className={styles.noteButton} onClick={onOpenNote}>
        <Icon name="pencil-square" /> Nota
      </button>
      <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
        <Icon name="x-lg" />
      </button>
    </div>
  )
}
