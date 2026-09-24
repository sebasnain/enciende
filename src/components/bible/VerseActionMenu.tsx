import type { HighlightColor } from '@/types/bible'
import { HighlightColorPicker } from './HighlightColorPicker'
import { Icon } from '@/components/ui/Icon'
import styles from './VerseActionMenu.module.css'

interface VerseActionMenuProps {
  verse: number
  color: HighlightColor | null
  onColorChange: (color: HighlightColor | null) => void
  onOpenNote: () => void
  onClose: () => void
}

export function VerseActionMenu({ verse, color, onColorChange, onOpenNote, onClose }: VerseActionMenuProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>Versículo {verse}</span>
      <HighlightColorPicker value={color} onSelect={onColorChange} />
      <button className={styles.noteButton} onClick={onOpenNote}>
        <Icon name="pencil-square" /> Nota
      </button>
      <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
        <Icon name="x-lg" />
      </button>
    </div>
  )
}
