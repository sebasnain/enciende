import { useState } from 'react'
import { AdminCrudPage, type AdminField } from '@/components/admin/AdminCrudPage'
import { devotionalsService, studiesService } from '@/services/content.service'
import { createEvent, deleteEvent, listUpcomingEvents, updateEvent } from '@/services/events.service'
import { createProduct, deleteProduct, listProducts, updateProduct } from '@/services/products.service'
import { createPlan, deletePlan, listPublishedPlans, updatePlan } from '@/services/plans.service'
import { useAuth } from '@/context/AuthContext'
import { PlanDaysEditor } from './PlanDaysEditor'
import { LiveSettingsEditor } from './LiveSettingsEditor'
import styles from './AdminDashboard.module.css'

const TABS = ['Devocionales', 'Estudios', 'Planes', 'Cronograma', 'Librería', 'En vivo'] as const
type Tab = (typeof TABS)[number]

const devotionalFields: AdminField[] = [
  { key: 'title', label: 'Título', type: 'text' },
  { key: 'body', label: 'Contenido (markdown)', type: 'textarea' },
  { key: 'coverImage', label: 'Imagen de portada (URL)', type: 'text' },
]

const studyFields: AdminField[] = [
  { key: 'title', label: 'Título', type: 'text' },
  { key: 'series', label: 'Serie', type: 'text' },
  { key: 'body', label: 'Contenido (markdown)', type: 'textarea' },
  { key: 'coverImage', label: 'Imagen de portada (URL)', type: 'text' },
]

const planFields: AdminField[] = [
  { key: 'title', label: 'Título', type: 'text' },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'durationDays', label: 'Duración (días)', type: 'number' },
  { key: 'category', label: 'Categoría', type: 'text' },
  { key: 'coverImage', label: 'Imagen de portada (URL)', type: 'text' },
  { key: 'published', label: 'Publicado', type: 'checkbox' },
]

const eventFields: AdminField[] = [
  { key: 'title', label: 'Título', type: 'text' },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'startAt', label: 'Fecha y hora', type: 'datetime' },
  { key: 'location', label: 'Lugar', type: 'text' },
  { key: 'category', label: 'Categoría', type: 'text' },
]

const productFields: AdminField[] = [
  { key: 'name', label: 'Nombre', type: 'text' },
  { key: 'priceLabel', label: 'Precio (texto)', type: 'text' },
  { key: 'imageURL', label: 'Imagen (URL)', type: 'text' },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'available', label: 'Disponible', type: 'checkbox' },
]

export function AdminDashboard() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>('Devocionales')

  return (
    <div>
      <h1>Panel de administración</h1>
      <p style={{ color: 'var(--color-ink-400)', marginBottom: 16 }}>Hola {profile?.displayName}, gestiona el contenido de Enciende.</p>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Devocionales' && (
        <AdminCrudPage
          title="Devocionales"
          fields={devotionalFields}
          defaults={{ title: '', body: '', coverImage: '', authorId: profile?.uid, authorName: profile?.displayName, tags: [] }}
          service={devotionalsService}
          labelOf={(item) => item.title}
        />
      )}

      {tab === 'Estudios' && (
        <AdminCrudPage
          title="Estudios"
          fields={studyFields}
          defaults={{ title: '', series: '', body: '', coverImage: '', authorId: profile?.uid, authorName: profile?.displayName }}
          service={studiesService}
          labelOf={(item) => item.title}
        />
      )}

      {tab === 'Planes' && (
        <AdminCrudPage
          title="Planes de lectura"
          fields={planFields}
          defaults={{ title: '', description: '', durationDays: 7, category: '', coverImage: '', published: false }}
          service={{ list: listPublishedPlans, create: createPlan, update: updatePlan, remove: deletePlan }}
          labelOf={(item) => item.title}
          keepEditingAfterCreate
          renderAfterField={(key, { form, editingId }) =>
            key === 'durationDays' ? (
              editingId ? (
                <PlanDaysEditor planId={editingId} durationDays={Number(form.durationDays) || 0} />
              ) : (
                <p style={{ color: 'var(--color-ink-400)', fontSize: 13, margin: '4px 0 0' }}>
                  Creá el plan para poder configurar sus días.
                </p>
              )
            ) : null
          }
        />
      )}

      {tab === 'Cronograma' && (
        <AdminCrudPage
          title="Actividades"
          fields={eventFields}
          defaults={{ title: '', description: '', startAt: '', endAt: null, location: '', category: 'culto' }}
          service={{ list: listUpcomingEvents, create: createEvent, update: updateEvent, remove: deleteEvent }}
          labelOf={(item) => item.title}
        />
      )}

      {tab === 'Librería' && (
        <AdminCrudPage
          title="Productos"
          fields={productFields}
          defaults={{ name: '', priceLabel: '', imageURL: '', description: '', available: true }}
          service={{ list: listProducts, create: createProduct, update: updateProduct, remove: deleteProduct }}
          labelOf={(item) => item.name}
        />
      )}

      {tab === 'En vivo' && <LiveSettingsEditor />}
    </div>
  )
}
