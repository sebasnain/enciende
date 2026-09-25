import type { HighlightColor, HighlightStyle } from '@/types/bible'
import type { PaintTool } from '@/utils/paint'
import { HighlightColorPicker } from '@/components/bible/HighlightColorPicker'
import { Icon } from '@/components/ui/Icon'
import styles from './MarkerToolbar.module.css'

export interface MarkerToolState {
  color: HighlightColor
  style: HighlightStyle
  erasing: boolean
}

export const DEFAULT_MARKER_TOOL: MarkerToolState = { color: 'amarillo', style: 'fill', erasing: false }

/** The paint tool a stroke applies, or null for the eraser. */
export function paintToolOf(tool: MarkerToolState): PaintTool | null {
  return tool.erasing ? null : { color: tool.color, style: tool.style }
}

/** ::highlight() rule used for the live preview (see global.css). */
export function previewNameOf(tool: MarkerToolState): string {
  return tool.erasing ? 'marker-erase' : `marker-${tool.color}`
}

interface MarkerToolbarProps {
  active: boolean
  tool: MarkerToolState
  onActiveChange: (active: boolean) => void
  onToolChange: (tool: MarkerToolState) => void
}

export function MarkerToolbar({ active, tool, onActiveChange, onToolChange }: MarkerToolbarProps) {
  if (!active) {
    return (
      <button type="button" className={styles.fab} onClick={() => onActiveChange(true)} aria-label="Resaltar" title="Resaltar">
        <Icon name="highlighter" />
      </button>
    )
  }

  return (
    <div className={styles.bar}>
      <p className={styles.hint}>
        {tool.erasing ? 'Pasá el dedo por lo que quieras borrar' : 'Pasá el dedo o el mouse por el texto para resaltar'}
      </p>
      <HighlightColorPicker
        color={tool.erasing ? null : tool.color}
        style={tool.style}
        onStyleChange={(style) => onToolChange({ ...tool, style, erasing: false })}
        onSelect={(color) => onToolChange({ ...tool, color: color ?? tool.color, erasing: false })}
      />
      <button
        type="button"
        className={`${styles.eraser} ${tool.erasing ? styles.eraserActive : ''}`}
        onClick={() => onToolChange({ ...tool, erasing: !tool.erasing })}
        aria-label="Goma"
        title="Goma"
      >
        <Icon name="eraser" />
      </button>
      <button type="button" className={styles.done} onClick={() => onActiveChange(false)}>
        Listo
      </button>
    </div>
  )
}
