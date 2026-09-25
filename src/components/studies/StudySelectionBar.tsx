import { useState } from 'react'
import type { HighlightColor, HighlightStyle } from '@/types/bible'
import { HighlightColorPicker } from '@/components/bible/HighlightColorPicker'
import { Icon } from '@/components/ui/Icon'
import styles from './StudySelectionBar.module.css'

interface StudySelectionBarProps {
  onPick: (color: HighlightColor, style: HighlightStyle) => void
  onClose: () => void
}

export function StudySelectionBar({ onPick, onClose }: StudySelectionBarProps) {
  const [style, setStyle] = useState<HighlightStyle>('fill')

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
      <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
        <Icon name="x-lg" />
      </button>
    </div>
  )
}
