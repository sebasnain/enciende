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
  { key: 'askMinistry', label: 'Preguntar si es danzarín/a o adorador/a (o sin especificar)', type: 'checkbox' },
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
