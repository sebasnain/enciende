/** Converts the browser's current text selection into plain-text character offsets
 * relative to `container`, as long as the whole selection sits inside it. */
export function getSelectionOffsets(container: HTMLElement): { start: number; end: number } | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null

  const range = selection.getRangeAt(0)
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null

  const preStart = document.createRange()
  preStart.selectNodeContents(container)
  preStart.setEnd(range.startContainer, range.startOffset)
  const start = preStart.toString().length

  const preEnd = document.createRange()
  preEnd.selectNodeContents(container)
  preEnd.setEnd(range.endContainer, range.endOffset)
  const end = preEnd.toString().length

  if (end <= start) return null
  return { start, end }
}
