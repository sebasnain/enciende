import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Icon } from '@/components/ui/Icon'
import styles from './AdminCrudPage.module.css'

export type AdminField = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'datetime' | 'select'
  options?: string[]
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
    if (field.type === 'number') {
      const raw = payload[field.key]
      payload[field.key] = typeof raw === 'string' ? (raw === '' ? null : Number(raw)) : raw
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
  const [saveError, setSaveError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const inlineFormRef = useRef<HTMLFormElement>(null)

  async function reload() {
    setItems(await service.list())
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (editingId) inlineFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [editingId])

  function startEdit(item: T) {
    setEditingId(item.id)
    setForm(item as unknown as Record<string, unknown>)
  }

  function resetForm() {
    setEditingId(null)
    setForm(defaults)
    setSaveError(null)
  }

  async function handleSubmit() {
    setSaving(true)
    setSaveError(null)
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
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await service.remove(id)
    await reload()
  }

  function submitLabel(idleLabel: string) {
    if (saving) return 'Guardando…'
    if (justSaved) return '✓ Guardado'
    return idleLabel
  }

  function renderFields() {
    return fields.map((field) => (
      <div key={field.key}>
        <label className={field.type === 'checkbox' ? styles.checkboxRow : undefined}>
          {field.type !== 'checkbox' && <span>{field.label}</span>}
          {field.type === 'textarea' ? (
            <textarea
              className={styles.textarea}
              value={(form[field.key] as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            />
          ) : field.type === 'select' ? (
            <select
              className={styles.input}
              value={(form[field.key] as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            >
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
              onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            />
          )}
        </label>
        {renderAfterField?.(field.key, { form, editingId })}
      </div>
    ))
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <div className={styles.layout}>
      <h2>{title}</h2>

      {!editingId && (
        <form className={styles.form} onSubmit={handleFormSubmit}>
          <p className={styles.modeNew}>
            <Icon name="plus-circle-fill" /> Nuevo
          </p>
          {renderFields()}
          <div className={styles.formActions}>
            <Button type="submit" disabled={saving}>
              {submitLabel('Crear')}
            </Button>
          </div>
          {saveError && <p className={styles.saveError}>{saveError}</p>}
        </form>
      )}

      {!items && <Spinner />}
      {items?.map((item) => (
        <div key={item.id}>
          <div className={`${styles.row} ${editingId === item.id ? styles.rowEditing : ''}`}>
            <span>{labelOf(item)}</span>
            <span className={styles.rowActions}>
              <button className={styles.link} onClick={() => (editingId === item.id ? resetForm() : startEdit(item))}>
                {editingId === item.id ? 'Cerrar' : 'Editar'}
              </button>
              <button className={styles.link} onClick={() => handleDelete(item.id)}>
                Eliminar
              </button>
            </span>
          </div>

          {editingId === item.id && (
            <form ref={inlineFormRef} className={styles.inlineForm} onSubmit={handleFormSubmit}>
              <p className={styles.modeEdit}>
                <Icon name="pencil-fill" /> Editando "{labelOf(item)}"
              </p>
              {renderFields()}
              <div className={styles.formActions}>
                <Button type="submit" disabled={saving}>
                  {submitLabel('Guardar cambios')}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
              {saveError && <p className={styles.saveError}>{saveError}</p>}
            </form>
          )}
        </div>
      ))}
    </div>
  )
}
