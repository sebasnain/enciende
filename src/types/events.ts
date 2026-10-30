export interface ChurchEvent {
  id: string
  title: string
  description: string
  /** Fecha puntual. Null en actividades semanales (usan `weekday`). */
  startAt: number | null
  endAt: number | null
  location: string | null
  category: string
  /** Días de la semana (0 = domingo … 6 = sábado) en que se repite la actividad. Vacío = fecha puntual. */
  weekdays?: number[]
  /** @deprecated Formato anterior (un solo día); se lee como `weekdays`. */
  weekday?: number | null
  /** Banner opcional que se muestra en "Actividad para hoy". */
  bannerImage?: string
  /** Hora "HH:mm" de las actividades semanales. */
  time?: string | null
  /** Fechas "YYYY-MM-DD" en que una actividad semanal está suspendida. */
  suspendedDates?: string[]
}

export const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const

export function weekdaysOf(event: ChurchEvent): number[] {
  if (event.weekdays?.length) return event.weekdays
  return typeof event.weekday === 'number' ? [event.weekday] : []
}

export function isWeekly(event: ChurchEvent): boolean {
  return weekdaysOf(event).length > 0
}

export function dateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "YYYY-MM-DD" → Date a medianoche local. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isSuspendedOn(event: ChurchEvent, date: Date): boolean {
  return !!event.suspendedDates?.includes(dateKey(date))
}

/** Próxima fecha (desde hoy, inclusive) en que cae el día de la semana de la actividad y no está suspendida. */
export function nextWeeklyDate(event: ChurchEvent, from = new Date()): Date | null {
  if (!isWeekly(event)) return null
  const days = weekdaysOf(event)
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  for (let i = 0; i < 120; i++) {
    if (days.includes(d.getDay()) && !isSuspendedOn(event, d)) return d
    d.setDate(d.getDate() + 1)
  }
  return null
}
