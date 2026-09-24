import { useEffect, useState } from 'react'
import { setPlanDay, listPlanDays } from '@/services/plans.service'
import { useBooks } from '@/hooks/useBooks'
import { formatPassageRefs } from '@/utils/passage'
import type { ReadingPlanDay } from '@/types/plans'
import { Button } from '@/components/ui/Button'
import styles from '@/components/admin/AdminCrudPage.module.css'

interface PlanDaysEditorProps {
  planId: string
  durationDays: number
}

const EMPTY_DAY_FORM = {
  title: '',
  bookId: 43,
  chapter: 1,
  verseStart: '',
  verseEnd: '',
  devotionalText: '',
}

export function PlanDaysEditor({ planId, durationDays }: PlanDaysEditorProps) {
  const [days, setDays] = useState<ReadingPlanDay[]>([])
  const [showDays, setShowDays] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_DAY_FORM)
  const [saving, setSaving] = useState(false)

  const books = useBooks('NVI')

  useEffect(() => {
    setShowDays(false)
    setSelectedDay(null)
    if (planId) listPlanDays(planId).then(setDays)
  }, [planId])

  function openDay(order: number) {
    setSelectedDay(order)
    const existing = days.find((d) => d.order === order)
    if (existing) {
      const ref = existing.passageRefs[0]
      setForm({
        title: existing.title ?? '',
        bookId: ref?.book ?? 43,
        chapter: ref?.chapter ?? 1,
        verseStart: ref?.verseStart ? String(ref.verseStart) : '',
        verseEnd: ref?.verseEnd ? String(ref.verseEnd) : '',
        devotionalText: existing.devotionalText ?? '',
      })
    } else {
      setForm(EMPTY_DAY_FORM)
    }
  }

  async function handleSaveDay() {
    if (selectedDay === null) return
    setSaving(true)
    try {
      const bookName = books.find((b) => b.bookid === form.bookId)?.name ?? ''
      await setPlanDay(planId, selectedDay, {
        title: form.title,
        passageRefs: [
          {
            book: form.bookId,
            bookName,
            chapter: form.chapter,
            ...(form.verseStart ? { verseStart: Number(form.verseStart) } : {}),
            ...(form.verseEnd ? { verseEnd: Number(form.verseEnd) } : {}),
          },
        ],
        devotionalText: form.devotionalText,
      })
      setDays(await listPlanDays(planId))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.layout}>
      <Button type="button" variant="secondary" onClick={() => setShowDays((s) => !s)}>
        {showDays ? 'Ocultar días' : 'Configurar días'}
      </Button>

      {showDays && (
        <>
          <div className={styles.dayButtonGrid}>
            {Array.from({ length: durationDays }, (_, i) => i + 1).map((n) => {
              const configured = days.some((d) => d.order === n)
              return (
                <button
                  key={n}
                  type="button"
                  className={`${styles.dayButton} ${configured ? styles.dayButtonDone : ''} ${selectedDay === n ? styles.dayButtonActive : ''}`}
                  onClick={() => openDay(n)}
                >
                  Día {n}
                  {configured ? ' ✓' : ''}
                </button>
              )
            })}
          </div>

          {selectedDay !== null && (
            <div className={styles.form}>
              <h3>Día {selectedDay}</h3>
              <label>
                <span>Título (opcional)</span>
                <input
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: El nuevo nacimiento"
                />
              </label>
              <label>
                <span>Libro (cita bíblica)</span>
                <select
                  className={styles.input}
                  value={form.bookId}
                  onChange={(e) => setForm((f) => ({ ...f, bookId: Number(e.target.value) }))}
                >
                  {books.map((b) => (
                    <option key={b.bookid} value={b.bookid}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Capítulo</span>
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  value={form.chapter}
                  onChange={(e) => setForm((f) => ({ ...f, chapter: Number(e.target.value) }))}
                />
              </label>
              <label>
                <span>Versículo inicial (opcional)</span>
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  value={form.verseStart}
                  onChange={(e) => setForm((f) => ({ ...f, verseStart: e.target.value }))}
                />
              </label>
              <label>
                <span>Versículo final (opcional)</span>
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  value={form.verseEnd}
                  onChange={(e) => setForm((f) => ({ ...f, verseEnd: e.target.value }))}
                />
              </label>
              <label>
                <span>Descripción (opcional)</span>
                <textarea
                  className={styles.textarea}
                  value={form.devotionalText}
                  onChange={(e) => setForm((f) => ({ ...f, devotionalText: e.target.value }))}
                  placeholder="Reflexión que verá el usuario ese día"
                />
              </label>
              <Button type="button" onClick={handleSaveDay} disabled={saving}>
                Guardar día {selectedDay}
              </Button>
            </div>
          )}
        </>
      )}

      {days.length > 0 && (
        <div>
          {days
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((day) => (
              <div key={day.id} className={styles.row}>
                <span>
                  Día {day.order}
                  {day.title ? `: ${day.title}` : ''} — {formatPassageRefs(day.passageRefs)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
