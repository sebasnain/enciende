interface Caret {
  node: Node
  offset: number
}

type CaretDocument = Document & {
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
  caretRangeFromPoint?: (x: number, y: number) => Range | null
}

/** Text position under a screen point (the caret the browser would place there). */
export function caretFromPoint(x: number, y: number): Caret | null {
  const doc = document as CaretDocument
  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y)
    return pos ? { node: pos.offsetNode, offset: pos.offset } : null
  }
  if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(x, y)
    return range ? { node: range.startContainer, offset: range.startOffset } : null
  }
  return null
}

/** Plain-text character offset of (node, offset) within `container`. */
export function textOffsetIn(container: HTMLElement, node: Node, offset: number): number {
  const range = document.createRange()
  range.selectNodeContents(container)
  range.setEnd(node, offset)
  return range.toString().length
}

/** Inverse of textOffsetIn: builds a DOM Range covering [start, end) of container's text. */
export function rangeFromOffsets(container: HTMLElement, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let pos = 0
  let started = false
  let node = walker.nextNode() as Text | null
  while (node) {
    const len = node.data.length
    if (!started && start <= pos + len) {
      range.setStart(node, start - pos)
      started = true
    }
    if (started && end <= pos + len) {
      range.setEnd(node, end - pos)
      return range
    }
    pos += len
    node = walker.nextNode() as Text | null
  }
  return null
}

const isSpace = (ch: string) => /\s/.test(ch)

/** Snaps a caret offset back to the start of the word it touches. */
export function wordStart(text: string, offset: number): number {
  let i = Math.min(Math.max(offset, 0), text.length)
  if (i > 0 && !isSpace(text[i - 1])) {
    while (i > 0 && !isSpace(text[i - 1])) i--
    return i
  }
  while (i < text.length && isSpace(text[i])) i++
  return i
}

/** Snaps a caret offset forward to the end of the word it touches. */
export function wordEnd(text: string, offset: number): number {
  let i = Math.min(Math.max(offset, 0), text.length)
  if (i < text.length && !isSpace(text[i])) {
    while (i < text.length && !isSpace(text[i])) i++
    return i
  }
  while (i > 0 && isSpace(text[i - 1])) i--
  return i
}
