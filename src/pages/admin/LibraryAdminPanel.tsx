import { useState } from 'react'
import { AdminCrudPage, type AdminField } from '@/components/admin/AdminCrudPage'
import { createLibraryTitle, deleteLibraryTitle, listLibraryTitles, updateLibraryTitle } from '@/services/library.service'
import { useAuth } from '@/context/AuthContext'
import { CopiesEditor } from './CopiesEditor'
import { IsbnScanButton } from './IsbnScanButton'
import { LoansManager } from './LoansManager'
import { ReservationsManager } from './ReservationsManager'
import { MembershipPlanEditor } from './MembershipPlanEditor'
import { MemberMembershipManager } from './MemberMembershipManager'
import styles from './AdminDashboard.module.css'

const SUB_TABS = ['Catálogo', 'Préstamos', 'Reservas', 'Membresías'] as const
type SubTab = (typeof SUB_TABS)[number]

const libraryTitleFields: AdminField[] = [
  { key: 'isbn', label: 'ISBN (opcional)', type: 'text' },
  { key: 'title', label: 'Título', type: 'text' },
  { key: 'author', label: 'Autor', type: 'text' },
  { key: 'publisher', label: 'Editorial', type: 'text' },
  { key: 'category', label: 'Categoría', type: 'text' },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'coverImageUrl', label: 'Imagen de portada (URL)', type: 'text' },
]

export function LibraryAdminPanel() {
  const { profile } = useAuth()
  const [subTab, setSubTab] = useState<SubTab>('Catálogo')
  const isAdmin = profile?.role === 'admin'

  return (
    <div>
      <div className={styles.tabs}>
        {SUB_TABS.map((t) => (
          <button key={t} className={`${styles.tab} ${subTab === t ? styles.active : ''}`} onClick={() => setSubTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Catálogo' && (
        <AdminCrudPage
          title="Catálogo de la biblioteca comunitaria"
          fields={libraryTitleFields}
          defaults={{ isbn: '', title: '', author: '', publisher: '', category: '', description: '', coverImageUrl: '' }}
          service={{ list: listLibraryTitles, create: createLibraryTitle, update: updateLibraryTitle, remove: deleteLibraryTitle }}
          labelOf={(item) => item.title}
          keepEditingAfterCreate
          renderBeforeNewForm={({ setFields }) => <IsbnScanButton onResult={setFields} />}
          renderAfterField={(key, { form, editingId }) =>
            key === 'coverImageUrl' ? (
              editingId ? (
                <CopiesEditor titleId={editingId} titleName={(form.title as string) || 'Sin título'} />
              ) : (
                <p style={{ color: 'var(--color-ink-400)', fontSize: 13, margin: '4px 0 0' }}>
                  Creá el título para poder agregar ejemplares.
                </p>
              )
            ) : null
          }
        />
      )}

      {subTab === 'Préstamos' && <LoansManager />}
      {subTab === 'Reservas' && <ReservationsManager />}
      {subTab === 'Membresías' && (
        <>
          <MembershipPlanEditor readOnly={!isAdmin} />
          <MemberMembershipManager />
        </>
      )}
    </div>
  )
}
