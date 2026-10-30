import { useEffect, useState } from 'react'
import { listUpcomingEvents } from '@/services/events.service'
import { WEEKDAYS, isWeekly, nextWeeklyDate, parseDateKey, dateKey, type ChurchEvent } from '@/types/events'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './Schedule.module.css'

const formatter = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })

interface Entry {
  event: ChurchEvent
  sortAt: number
  dateLabel: string
  suspendedLabels: string[]
}

function buildEntry(event: ChurchEvent): Entry | null {
  if (isWeekly(event)) {
    const next = nextWeeklyDate(event)
    const todayKey = dateKey(new Date())
    const suspendedLabels = (event.suspendedDates ?? [])
      .filter((key) => key >= todayKey && parseDateKey(key).getDay() === event.weekday)
      .map((key) => dayFormatter.format(parseDateKey(key)))
    const when = `Todos los ${WEEKDAYS[event.weekday!]}${event.time ? ` · ${event.time} hs` : ''}`
    const [h, m] = (event.time ?? '').split(':').map(Number)
    const sortAt = next ? next.getTime() + ((h || 0) * 60 + (m || 0)) * 60000 : Number.MAX_SAFE_INTEGER
    return { event, sortAt, dateLabel: next ? `${when} · próxima: ${dayFormatter.format(next)}` : when, suspendedLabels }
  }
  if (!Number.isFinite(event.startAt)) return null
  return { event, sortAt: event.startAt!, dateLabel: formatter.format(new Date(event.startAt!)), suspendedLabels: [] }
}

export function Schedule() {
  const [events, setEvents] = useState<ChurchEvent[] | null>(null)

  useEffect(() => {
    listUpcomingEvents().then(setEvents)
  }, [])

  if (!events) return <Spinner />
  const entries = events.map(buildEntry).filter((e): e is Entry => e !== null).sort((a, b) => a.sortAt - b.sortAt)
  if (entries.length === 0) return <EmptyState message="No hay actividades programadas por ahora." />

  return (
    <div>
      <h1>Cronograma</h1>
      {entries.map(({ event, dateLabel, suspendedLabels }) => (
        <div key={event.id} className={styles.event}>
          <p className={styles.date}>{dateLabel}</p>
          <p className={styles.title}>{event.title}</p>
          {event.location && <p className={styles.location}>{event.location}</p>}
          <p>{event.description}</p>
          {suspendedLabels.map((label) => (
            <p key={label} className={styles.suspended}>
              Suspendida el {label}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}
