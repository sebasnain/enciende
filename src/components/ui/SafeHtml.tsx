import { createElement, type ReactNode } from 'react'

const ALLOWED: Record<string, string> = {
  B: 'strong',
  STRONG: 'strong',
  I: 'em',
  EM: 'em',
  P: 'p',
  BR: 'br',
  SUP: 'sup',
  SUB: 'sub',
}

function toReact(node: Node, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const children = Array.from(node.childNodes, (child, i) => toReact(child, i))
  const tag = ALLOWED[(node as Element).tagName]
  if (tag === 'br') return createElement('br', { key })
  // Unknown tags (links, custom <el>, spans...) are unwrapped: keep their text, drop the tag.
  return tag ? createElement(tag, { key }, ...children) : createElement('span', { key }, ...children)
}

/** Renders third-party HTML as React elements, keeping only basic formatting tags and never
 * attributes, so nothing from the source can run script or inject links. */
export function SafeHtml({ html }: { html: string }) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return <>{Array.from(doc.body.childNodes, (node, i) => toReact(node, i))}</>
}
