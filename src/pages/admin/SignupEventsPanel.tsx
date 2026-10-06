import { useEffect, useState } from 'react'
import { AdminCrudPage, type AdminField } from '@/components/admin/AdminCrudPage'
import {
  createSignupEvent,
  deleteSignupEvent,
  getSignupEvent,
  listSignupEvents,
  updateSignupEvent,
} from '@/services/signups.service'
import type { SignupEvent } from '@/types/signups'
import { RegistrationsList } from './RegistrationsList'
import { downloadRegistrationsPdf } from './registrationsPdf'
import styles from '@/components/admin/AdminCrudPage.module.css'

const signupEventFields: AdminField[] = [
  { key: 'title', label: 'Título del evento', type: 'text' },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'eventDate', label: 'Fecha y hora del evento (opcional)', type: 'datetime', optional: true },
  { key: 'location', label: 'Lugar', type: 'text' },
  { key: 'bannerImageUrl', label: 'Banner chico del Inicio, 1200x400 (ej: /banners/evento.jpg o una URL)', type: 'text' },
  { key: 'popupImageUrl', label: 'Banner grande, 1 vez por día, 1080x1350 (ej: /banners/evento-grande.jpg, opcional)', type: 'text' },
  { key: 'showFrom', label: 'Mostrar banner desde (opcional)', type: 'datetime', optional: true },
  { key: 'showUntil', label: 'Mostrar banner hasta, y cerrar inscripción (opcional)', type: 'datetime', optional: true },
  { key: 'capacity', label: 'Cupo máximo de personas (vacío = sin límite)', type: 'number' },
  { key: 'askMinistry', label: 'Preguntar si es danzor o adorador (o sin especificar)', type: 'checkbox' },
]

interface SignupEventsPanelProps {
  readOnly: boolean
}

export function SignupEventsPanel({ readOnly }: SignupEventsPanelProps) {
  return (
    <AdminCrudPage<SignupEvent>
      title="Eventos con inscripción"
      fields={signupEventFields}
      defaults={{
        title: '',
        description: '',
        eventDate: '',
        location: '',
        bannerImageUrl: '',
        popupImageUrl: '',
        showFrom: '',
        showUntil: '',
        capacity: '',
        askMinistry: false,
      }}
      service={{
        list: listSignupEvents,
        create: createSignupEvent,
        update: updateSignupEvent,
        remove: async (id: string) => {
          if (!window.confirm('¿Eliminar el evento y TODAS sus inscripciones? No se puede deshacer.')) return
          await deleteSignupEvent(id)
        },
      }}
      labelOf={(item) => `${item.title} (${item.registeredCount}${item.capacity ? `/${item.capacity}` : ''} inscriptos)`}
      readOnly={readOnly}
      renderRowActions={(item) => <PdfRowButton event={item} />}
      keepEditingAfterCreate
      renderAfterField={(key, { editingId }) => {
        if (key !== 'askMinistry' || readOnly) return null
        return editingId ? (
          <EditingRegistrations eventId={editingId} />
        ) : (
          <p style={{ color: 'var(--color-ink-400)', fontSize: 13, margin: '4px 0 0' }}>
            Creá el evento para ver las inscripciones y descargar la lista.
          </p>
        )
      }}
    />
  )
}


/** Trae el evento fresco (con el contador actual) para no mostrar inscriptos desactualizados del formulario. */
function EditingRegistrations({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<SignupEvent | null>(null)

  useEffect(() => {
    getSignupEvent(eventId).then(setEvent)
  }, [eventId])

  return event ? <RegistrationsList event={event} /> : null
}

/** Descarga la lista de inscriptos desde el listado, sin tener que abrir el evento para editarlo. */
function PdfRowButton({ event }: { event: SignupEvent }) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    try {
      await downloadRegistrationsPdf(event)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo generar el PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" className={styles.link} onClick={handleClick} disabled={busy}>
      {busy ? 'Generando…' : 'PDF'}
    </button>
  )
}
