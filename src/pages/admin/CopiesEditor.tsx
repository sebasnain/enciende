import { useEffect, useState } from 'react'
import { createLibraryCopy, deleteLibraryCopy, listCopiesByTitle, updateLibraryCopy } from '@/services/library.service'
import { LIBRARY_COPY_CONDITIONS, type LibraryCopy, type LibraryCopyCondition } from '@/types/library'
import { Button } from '@/components/ui/Button'
import { CopyQrModal } from '@/components/admin/CopyQrModal'
import styles from '@/components/admin/AdminCrudPage.module.css'

interface CopiesEditorProps {
  titleId: string
  titleName: string
}

// "prestado" y "reservado" los va a fijar automáticamente el flujo de préstamos (etapa siguiente); acá solo se
// gestionan a mano los estados que dependen del bibliotecario.
const MANUAL_STATUSES = ['disponible', 'extraviado', 'fuera_de_circulacion'] as const
type ManualStatus = (typeof MANUAL_STATUSES)[number]

const STATUS_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  prestado: 'Prestado',
  reservado: 'Reservado',
  extraviado: 'Extraviado',
  fuera_de_circulacion: 'Fuera de circulación',
}

const EMPTY_FORM: { condition: LibraryCopyCondition; notes: string } = { condition: 'bueno', notes: '' }

export function CopiesEditor({ titleId, titleName }: CopiesEditorProps) {
  const [copies, setCopies] = useState<LibraryCopy[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [qrCopyId, setQrCopyId] = useState<string | null>(null)

  async function reload() {
    setCopies(await listCopiesByTitle(titleId))
  }

  useEffect(() => {
    setLoading(true)
    reload().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleId])

  function startEdit(copy: LibraryCopy) {
    setEditingId(copy.id)
    setForm({ condition: copy.condition, notes: copy.notes })
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleAdd() {
    setSaving(true)
    try {
      await createLibraryCopy({
        titleId,
        status: 'disponible',
        condition: form.condition,
        notes: form.notes,
        acquiredAt: Date.now(),
      })
      await reload()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    if (!editingId) return
    setSaving(true)
    try {
      await updateLibraryCopy(editingId, { condition: form.condition, notes: form.notes })
      await reload()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(copy: LibraryCopy, status: ManualStatus) {
    await updateLibraryCopy(copy.id, { status })
    await reload()
  }

  async function handleDelete(copyId: string) {
    await deleteLibraryCopy(copyId)
    await reload()
    if (editingId === copyId) resetForm()
  }

  return (
    <div style={{ marginTop: 8 }}>
      <h3 style={{ fontSize: 15, margin: '8px 0' }}>Ejemplares ({copies.length})</h3>

      {loading && <p style={{ color: 'var(--color-ink-400)', fontSize: 13 }}>Cargando…</p>}
      {!loading && copies.length === 0 && (
        <p style={{ color: 'var(--color-ink-400)', fontSize: 13 }}>Todavía no hay ejemplares cargados para este título.</p>
      )}

      {copies.map((copy) => (
        <div key={copy.id} className={styles.row}>
          <span>
            Ejemplar #{copy.id.slice(-6)} · {copy.condition} ·{' '}
            {copy.status === 'prestado' || copy.status === 'reservado' ? (
              STATUS_LABELS[copy.status]
            ) : (
              <select
                className={styles.input}
                style={{ display: 'inline-block', width: 'auto' }}
                value={copy.status}
                onChange={(e) => handleStatusChange(copy, e.target.value as ManualStatus)}
              >
                {MANUAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            )}
          </span>
          <span className={styles.rowActions}>
            <button type="button" className={styles.link} onClick={() => setQrCopyId(copy.id)}>
              Ver QR
            </button>
            <button type="button" className={styles.link} onClick={() => (editingId === copy.id ? resetForm() : startEdit(copy))}>
              {editingId === copy.id ? 'Cerrar' : 'Editar'}
            </button>
            <button type="button" className={styles.link} onClick={() => handleDelete(copy.id)}>
              Eliminar
            </button>
          </span>
        </div>
      ))}

      {qrCopyId && <CopyQrModal copyId={qrCopyId} titleName={titleName} onClose={() => setQrCopyId(null)} />}

      <div className={styles.form} style={{ marginTop: 8 }}>
        <p className={editingId ? styles.modeEdit : styles.modeNew}>{editingId ? 'Editando ejemplar' : 'Agregar ejemplar'}</p>
        <label>
          <span>Estado físico</span>
          <select
            className={styles.input}
            value={form.condition}
            onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as LibraryCopyCondition }))}
          >
            {LIBRARY_COPY_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Notas (opcional)</span>
          <textarea className={styles.textarea} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </label>
        <div className={styles.formActions}>
          <Button type="button" onClick={editingId ? handleSaveEdit : handleAdd} disabled={saving}>
            {editingId ? 'Guardar cambios' : 'Agregar ejemplar'}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
