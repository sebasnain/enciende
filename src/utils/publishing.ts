export interface Schedulable {
  publishAt?: number | null
}

/** Sin fecha de publicación (o con fecha ya cumplida) el contenido se muestra a los miembros. */
export function isPublishedNow(item: Schedulable, now = Date.now()): boolean {
  return !item.publishAt || item.publishAt <= now
}

export function isScheduled(item: Schedulable, now = Date.now()): boolean {
  return !!item.publishAt && item.publishAt > now
}

export function scheduledSuffix(item: Schedulable): string {
  if (!isScheduled(item)) return ''
  const when = new Date(item.publishAt!).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  return ` — programado para ${when}`
}

/** `publishedAt` lo guarda Firestore como Timestamp (no como número), así que se normaliza para ordenar. */
export function toMillis(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis()
  }
  return 0
}

export function publishedSortKey(item: Schedulable & { publishedAt?: unknown }): number {
  return item.publishAt ?? toMillis(item.publishedAt)
}
