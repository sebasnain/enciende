import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode, type SyntheticEvent } from 'react'
import { caretFromPoint, rangeFromOffsets, textOffsetIn, wordEnd, wordStart } from '@/utils/textSelection'
import styles from './MarkerLayer.module.css'

/** A painted span inside one text unit (a verse or a study paragraph). */
export interface MarkedRange {
  unitKey: string
  start: number
  end: number
}

interface Hit {
  unitKey: string
  order: number
  textEl: HTMLElement
  offset: number
}

interface MarkerLayerProps {
  active: boolean
  /** Name of the ::highlight() rule used for the live preview (depends on the chosen color). */
  previewName: string
  onPaint: (ranges: MarkedRange[]) => void
  children: ReactNode
}

type HighlightApi = { registry: Map<string, unknown>; Ctor: new (...ranges: Range[]) => unknown }

function highlightApi(): HighlightApi | null {
  const registry = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights
  const Ctor = (window as unknown as { Highlight?: HighlightApi['Ctor'] }).Highlight
  return registry && Ctor ? { registry, Ctor } : null
}

function textElOf(unit: HTMLElement): HTMLElement | null {
  return unit.matches('[data-unit-text]') ? unit : unit.querySelector<HTMLElement>('[data-unit-text]')
}

/**
 * Wraps readable text made of "units" (elements with data-unit-key / data-unit-order, whose
 * text lives in a [data-unit-text] element). While active, dragging a finger or the mouse over
 * the text paints whole words, previewed live, and reports the result on release.
 */
export function MarkerLayer({ active, previewName, onPaint, children }: MarkerLayerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<Hit | null>(null)
  const focusRef = useRef<Hit | null>(null)
  const shownPreviewRef = useRef<string | null>(null)
  const frameRef = useRef<number | null>(null)

  // A still finger would otherwise trigger iOS/Android's own long-press text selection.
  useEffect(() => {
    const el = rootRef.current
    if (!el || !active) return
    const block = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
    }
    el.addEventListener('touchstart', block, { passive: false })
    return () => el.removeEventListener('touchstart', block)
  }, [active])

  useEffect(() => {
    if (!active) cancelStroke()
    return cancelStroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  function hitTest(x: number, y: number): Hit | null {
    const caret = caretFromPoint(x, y)
    if (!caret) return null
    const base = caret.node.nodeType === Node.ELEMENT_NODE ? (caret.node as Element) : caret.node.parentElement
    const textEl = base?.closest<HTMLElement>('[data-unit-text]')
    if (!textEl || !rootRef.current?.contains(textEl)) return null
    const unitEl = textEl.closest<HTMLElement>('[data-unit-key]')
    if (!unitEl?.dataset.unitKey) return null
    return {
      unitKey: unitEl.dataset.unitKey,
      order: Number(unitEl.dataset.unitOrder),
      textEl,
      offset: textOffsetIn(textEl, caret.node, caret.offset),
    }
  }

  function computeRanges(): MarkedRange[] {
    const a = anchorRef.current
    const f = focusRef.current
    const root = rootRef.current
    if (!a || !f || !root) return []

    const forward = a.order < f.order || (a.order === f.order && a.offset <= f.offset)
    const first = forward ? a : f
    const last = forward ? f : a
    const firstText = first.textEl.textContent ?? ''

    if (first.unitKey === last.unitKey) {
      const start = wordStart(firstText, first.offset)
      const end = wordEnd(firstText, last.offset)
      return end > start ? [{ unitKey: first.unitKey, start, end }] : []
    }

    const ranges: MarkedRange[] = [{ unitKey: first.unitKey, start: wordStart(firstText, first.offset), end: firstText.length }]
    root.querySelectorAll<HTMLElement>('[data-unit-key]').forEach((unit) => {
      const order = Number(unit.dataset.unitOrder)
      if (order <= first.order || order >= last.order) return
      const len = textElOf(unit)?.textContent?.length ?? 0
      ranges.push({ unitKey: unit.dataset.unitKey!, start: 0, end: len })
    })
    const lastText = last.textEl.textContent ?? ''
    ranges.push({ unitKey: last.unitKey, start: 0, end: wordEnd(lastText, last.offset) })

    return ranges.filter((r) => r.end > r.start)
  }

  function clearPreview() {
    const api = highlightApi()
    if (api && shownPreviewRef.current) api.registry.delete(shownPreviewRef.current)
    shownPreviewRef.current = null
  }

  function showPreview() {
    const api = highlightApi()
    const root = rootRef.current
    if (!api || !root) return
    const domRanges: Range[] = []
    for (const r of computeRanges()) {
      const unit = root.querySelector<HTMLElement>(`[data-unit-key="${CSS.escape(r.unitKey)}"]`)
      const textEl = unit && textElOf(unit)
      const range = textEl && rangeFromOffsets(textEl, r.start, r.end)
      if (range) domRanges.push(range)
    }
    clearPreview()
    api.registry.set(previewName, new api.Ctor(...domRanges))
    shownPreviewRef.current = previewName
  }

  function cancelStroke() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    anchorRef.current = null
    focusRef.current = null
    clearPreview()
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!active || (e.pointerType === 'mouse' && e.button !== 0)) return
    const hit = hitTest(e.clientX, e.clientY)
    if (!hit) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    anchorRef.current = hit
    focusRef.current = hit
    showPreview()
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!anchorRef.current) return
    const hit = hitTest(e.clientX, e.clientY)
    if (!hit) return
    focusRef.current = hit
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null
        showPreview()
      })
    }
  }

  function handlePointerUp() {
    if (!anchorRef.current) return
    const ranges = computeRanges()
    cancelStroke()
    if (ranges.length > 0) onPaint(ranges)
  }

  // While painting, taps must not follow links or open notes.
  function swallow(e: SyntheticEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      ref={rootRef}
      className={active ? styles.active : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelStroke}
      onClickCapture={active ? swallow : undefined}
      onContextMenuCapture={active ? swallow : undefined}
    >
      {children}
    </div>
  )
}
