import type { HighlightColor } from '@/types/bible'
import styles from './HighlightColorPicker.module.css'

const COLORS: HighlightColor[] = ['amarillo', 'verde', 'celeste', 'rosa', 'lila']

export function HighlightColorPicker({
  value,
  onSelect,
}: {
  value: HighlightColor | null
  onSelect: (color: HighlightColor | null) => void
}) {
  return (
    <div className={styles.row}>
      {COLORS.map((color) => (
        <button
          key={color}
          className={`${styles.swatch} ${value === color ? styles.selected : ''}`}
          style={{ background: `var(--highlight-${color})` }}
          aria-label={color}
          onClick={() => onSelect(value === color ? null : color)}
        />
      ))}
    </div>
  )
}
