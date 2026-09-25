import type { HighlightColor, HighlightStyle } from '@/types/bible'

export interface PaintTool {
  color: HighlightColor
  style: HighlightStyle
}

export interface PaintRange {
  start: number
  end: number
  color: HighlightColor
  style: HighlightStyle
}

export interface ExistingRange extends PaintRange {
  id: string
}

/** Applies one marker stroke over [start, end) of a single verse/paragraph, like paint:
 * - same color+style ranges it touches are merged into it,
 * - other ranges it overlaps are trimmed around it (their uncovered parts survive),
 * - with tool = null (eraser) the covered span is cut out of everything. */
export function applyPaint(existing: ExistingRange[], start: number, end: number, tool: PaintTool | null) {
  let s = start
  let e = end
  const merged = new Set<string>()

  if (tool) {
    let changed = true
    while (changed) {
      changed = false
      for (const h of existing) {
        if (merged.has(h.id) || h.color !== tool.color || h.style !== tool.style) continue
        if (h.start <= e && h.end >= s) {
          s = Math.min(s, h.start)
          e = Math.max(e, h.end)
          merged.add(h.id)
          changed = true
        }
      }
    }
  }

  const remove = [...merged]
  const add: PaintRange[] = []

  for (const h of existing) {
    if (merged.has(h.id) || h.start >= e || h.end <= s) continue
    remove.push(h.id)
    if (h.start < s) add.push({ start: h.start, end: s, color: h.color, style: h.style })
    if (h.end > e) add.push({ start: e, end: h.end, color: h.color, style: h.style })
  }

  if (tool) add.push({ start: s, end: e, color: tool.color, style: tool.style })

  return { remove, add }
}
