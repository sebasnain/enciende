import type { CSSProperties } from 'react'
import type { HighlightColor, HighlightStyle } from '@/types/bible'
import styles from './Marks.module.css'

/** className + inline style for a <mark>, shared by Bible verses and study paragraphs. */
export function markProps(color: HighlightColor, style: HighlightStyle) {
  return {
    className: style === 'fill' ? styles.fill : styles.pencil,
    style: { '--mark-color': `var(--highlight-${color})` } as CSSProperties,
  }
}
