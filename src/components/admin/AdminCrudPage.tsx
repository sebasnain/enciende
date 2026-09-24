import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import styles from './AdminCrudPage.module.css'

export type AdminField = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'datetime'
}

function toDatetimeLocalValue(raw: unknown): string {
  if (typeof raw === 'number') {
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return typeof raw === 'string' ? raw : ''
}

function buildPayload(form: Record<string, unknown>, fields: AdminField[]): Record<string, unknown> {
  const payload = { ...form }
  for (const field of fields) {
    if (field.type === 'datetime') {
      const raw = payload[field.key]
      payload[field.key] = typeof raw === 'string' && raw ? new Date(raw).getTime() : null
    }
  }
  return payload
}

interface AdminCrudPageProps<T extends { id: string }> {
  title: string
  fields: AdminField[]
  defaults: Record<string, unknown>
  service: {
    list: () => Promise<T[]>
    create: (data: any) => Promise<unknown>
    update: (id: string, data: any) => Promise<unknown>
    remove: (id: string) => Promise<unknown>
  }
  labelOf: (item: T) => string
  /** Render extra content right after a given field (matched by key), e.g. a follow-up action tied to that field's value. */
  renderAfterField?: (key: string, ctx: { form: Record<string, unknown>; editingId: string | null }) => ReactNode
  /** After creating a new item, keep it open for editing instead of resetting the form. */
  keepEditingAfterCreate?: boolean
}

export function AdminCrudPage<T extends { id: string }>({
  title,
  fields,
  defaults,
  service,
  labelOf,
  renderAfterField,
  keepEditingAfterCreate,
}: AdminCrudPageProps<T>) {
  const [items, setItems] = useState<T[] | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>(defaults)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setItems(await service.list())
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEdit(item: T) {
    setEditingId(item.id)
    setForm(item as unknown as Record<string, unknown>)
  }

  function resetForm() {
    setEditingId(null)
    setForm(defaults)
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      const payload = buildPayload(form, fields)
      if (editingId) {
        await service.update(editingId, payload)
        resetForm()
      } else {
        const newId = await service.create(payload)
        if (keepEditingAfterCreate && typeof newId === 'string') {
          setEditingId(newId)
          setForm({ ...payload, id: newId })
        } else {
          resetForm()
        }
      }
      await reload()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await service.remove(id)
    await reload()
  }

  return (
    <div className={styles.layout}>
      <h2>{title}</h2>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        {fields.map((field) => (
          <div key={field.key}>
            <label className={field.type === 'checkbox' ? styles.checkboxRow : undefined}>
              {field.type !== 'checkbox' && <span>{field.label}</span>}
              {field.type === 'textarea' ? (
                <textarea
                  className={styles.textarea}
                  value={(form[field.key] as string) ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                />
              ) : field.type === 'checkbox' ? (
                <>
                  <input
                    type="checkbox"
                    checked={!!form[field.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.checked }))}
                  />
                  {field.label}
                </>
              ) : (
                <input
                  className={styles.input}
                  type={field.type === 'number' ? 'number' : field.type === 'datetime' ? 'datetime-local' : 'text'}
                  required={field.type === 'datetime'}
                  value={field.type === 'datetime' ? toDatetimeLocalValue(form[field.key]) : ((form[field.key] as string | number) ?? '')}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                    }))
                  }
                />
              )}
            </label>
            {renderAfterField?.(field.key, { form, editingId })}
          </div>
        ))}
        <div className={styles.formActions}>
          <Button type="submit" disabled={saving}>
            {editingId ? 'Guardar cambios' : 'Crear'}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {!items && <Spinner />}
      {items?.map((item) => (
        <div key={item.id} className={styles.row}>
          <span>{labelOf(item)}</span>
          <span className={styles.rowActions}>
            <button className={styles.link} onClick={() => startEdit(item)}>
              Editar
            </button>
            <button className={styles.link} onClick={() => handleDelete(item.id)}>
              Eliminar
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}
