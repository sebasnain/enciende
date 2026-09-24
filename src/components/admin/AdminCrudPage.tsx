import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import styles from './AdminCrudPage.module.css'

export type AdminField = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'datetime'
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
}

export function AdminCrudPage<T extends { id: string }>({
  title,
  fields,
  defaults,
  service,
  labelOf,
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
      if (editingId) {
        await service.update(editingId, form)
      } else {
        await service.create(form)
      }
      resetForm()
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

      <div className={styles.form}>
        {fields.map((field) => (
          <label key={field.key} className={field.type === 'checkbox' ? styles.checkboxRow : undefined}>
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
                value={(form[field.key] as string | number) ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                  }))
                }
              />
            )}
          </label>
        ))}
        <div className={styles.formActions}>
          <Button onClick={handleSubmit} disabled={saving}>
            {editingId ? 'Guardar cambios' : 'Crear'}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

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
