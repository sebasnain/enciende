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
          aria-label="Marcador"
          title="Marcador"
        >
          <Icon name="highlighter" />
        </button>
        <button
          type="button"
          className={`${styles.styleButton} ${style === 'pencil' ? styles.styleActive : ''}`}
          onClick={() => onStyleChange('pencil')}
          aria-label="Lápiz"
          title="Lápiz"
        >
          <Icon name="pencil" />
        </button>
      </div>
      <div className={styles.row}>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.swatch} ${color === c ? styles.selected : ''} ${style === 'pencil' ? styles.swatchOutline : ''}`}
            style={style === 'pencil' ? { borderColor: `var(--highlight-${c})` } : { background: `var(--highlight-${c})` }}
            aria-label={c}
            onClick={() => onSelect(color === c ? null : c)}
          />
        ))}
      </div>
    </div>
  )
}
