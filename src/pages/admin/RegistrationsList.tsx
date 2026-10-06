import { useEffect, useState } from 'react'
import { listRegistrations, removeRegistration } from '@/services/signups.service'
import { ministryLabel, type SignupEvent, type SignupRegistration } from '@/types/signups'
import styles from '@/components/admin/AdminCrudPage.module.css'

interface RegistrationsListProps {
  event: SignupEvent
}

export function RegistrationsList({ event }: RegistrationsListProps) {
  const [registrations, setRegistrations] = useState<SignupRegistration[] | null>(null)
  const [count, setCount] = useState(event.registeredCount)
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    setRegistrations(await listRegistrations(event.id))
  }

  useEffect(() => {
    setCount(event.registeredCount)
    reload().catch(() => setError('No se pudieron cargar las inscripciones.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id])

  async function handleRemove(registration: SignupRegistration) {
    if (!window.confirm(`¿Quitar la inscripción de ${registration.firstName} ${registration.lastName} (${registration.totalPeople} personas)?`)) return
    await removeRegistration(event.id, registration, count)
    setCount((c) => Math.max(0, c - registration.totalPeople))
    await reload()
  }

  return (
    <div style={{ marginTop: 8 }}>
      <h3 style={{ fontSize: 15, margin: '8px 0' }}>
        Inscriptos: {count}
        {event.capacity ? ` de ${event.capacity} cupos` : ''}
      </h3>
      {error && <p className={styles.saveError}>{error}</p>}
      {!registrations && !error && <p style={{ color: 'var(--color-ink-400)', fontSize: 13 }}>Cargando…</p>}
      {registrations?.length === 0 && <p style={{ color: 'var(--color-ink-400)', fontSize: 13 }}>Todavía no hay inscripciones.</p>}

      {registrations?.map((r) => (
        <div key={r.id} className={styles.row}>
          <span>
            {r.firstName} {r.lastName} ({r.age}){event.askMinistry ? ` · ${ministryLabel(r.ministry)}` : ''} · {r.church} · {r.city} · {r.phone}
            {r.isGroupLeader && (
              <>
                <br />
                <span style={{ fontSize: 12, color: 'var(--color-ink-400)' }}>
                  Líder de grupo, con: {r.companions.map((c) => `${c.firstName} ${c.lastName} (${c.age}${event.askMinistry ? `, ${ministryLabel(c.ministry)}` : ''})`).join(', ')}
                </span>
              </>
            )}
          </span>
          <span className={styles.rowActions}>
            <button type="button" className={styles.link} onClick={() => handleRemove(r)}>
              Quitar
            </button>
          </span>
        </div>
      ))}

    </div>
  )
}
