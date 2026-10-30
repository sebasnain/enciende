export interface ChurchEvent {
  id: string
  title: string
  description: string
  /** Fecha puntual. Null en actividades semanales (usan `weekday`). */
  startAt: number | null
  endAt: number | null
  location: string | null
  category: string
  /** Día de la semana (0 = domingo … 6 = sábado) si la actividad se repite cada semana. */
  weekday?: number | null
  /** Hora "HH:mm" de las actividades semanales. */
  time?: string | null
  /** Fechas "YYYY-MM-DD" en que una actividad semanal está suspendida. */
  suspendedDates?: string[]
}

export const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const

export function isWeekly(event: ChurchEvent): boolean {
  return typeof event.weekday === 'number' && event.weekday >= 0 && event.weekday <= 6
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
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  d.setDate(d.getDate() + ((event.weekday! - d.getDay() + 7) % 7))
  for (let i = 0; i < 60; i++) {
    if (!isSuspendedOn(event, d)) return d
    d.setDate(d.getDate() + 7)
  }
  return null
}
