import { useEffect, useState } from 'react'
import { listUpcomingEvents } from '@/services/events.service'
import type { ChurchEvent } from '@/types/events'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './Schedule.module.css'

const formatter = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

export function Schedule() {
  const [events, setEvents] = useState<ChurchEvent[] | null>(null)

  useEffect(() => {
    listUpcomingEvents().then(setEvents)
  }, [])

  if (!events) return <Spinner />
  const validEvents = events.filter((event) => Number.isFinite(event.startAt))
  if (validEvents.length === 0) return <EmptyState message="No hay actividades programadas por ahora." />

  return (
    <div>
      <h1>Cronograma</h1>
      {validEvents.map((event) => (
        <div key={event.id} className={styles.event}>
          <p className={styles.date}>{formatter.format(new Date(event.startAt))}</p>
          <p className={styles.title}>{event.title}</p>
          {event.location && <p className={styles.location}>{event.location}</p>}
          <p>{event.description}</p>
        </div>
      ))}
    </div>
  )
}
