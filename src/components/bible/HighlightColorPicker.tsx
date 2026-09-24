import type { HighlightColor, HighlightStyle } from '@/types/bible'
import { Icon } from '@/components/ui/Icon'
import styles from './HighlightColorPicker.module.css'

const COLORS: HighlightColor[] = ['amarillo', 'verde', 'celeste', 'rosa', 'lila']

interface HighlightColorPickerProps {
  color: HighlightColor | null
  style: HighlightStyle
  onSelect: (color: HighlightColor | null) => void
  onStyleChange: (style: HighlightStyle) => void
}

export function HighlightColorPicker({ color, style, onSelect, onStyleChange }: HighlightColorPickerProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.styleToggle}>
        <button
          type="button"
          className={`${styles.styleButton} ${style === 'fill' ? styles.styleActive : ''}`}
          onClick={() => onStyleChange('fill')}
          aria-label="Resaltado con color"
          title="Resaltado"
        >
          <Icon name="pen-fill" />
        </button>
        <button
          type="button"
          className={`${styles.styleButton} ${style === 'circle' ? styles.styleActive : ''}`}
          onClick={() => onStyleChange('circle')}
          aria-label="Círculo a mano"
          title="Círculo"
        >
          <Icon name="circle" />
        </button>
      </div>
      <div className={styles.row}>
        {COLORS.map((c) => (
          <button
            key={c}
            className={`${styles.swatch} ${color === c ? styles.selected : ''} ${style === 'circle' ? styles.swatchOutline : ''}`}
            style={style === 'circle' ? { borderColor: `var(--highlight-${c})` } : { background: `var(--highlight-${c})` }}
            aria-label={c}
            onClick={() => onSelect(color === c ? null : c)}
          />
        ))}
      </div>
    </div>
  )
}
