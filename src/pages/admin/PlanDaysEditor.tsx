import { useEffect, useState } from 'react'
import { addPlanDay, listPlanDays, listPublishedPlans } from '@/services/plans.service'
import { useBooks } from '@/hooks/useBooks'
import { formatPassageRefs } from '@/utils/passage'
import type { ReadingPlan, ReadingPlanDay } from '@/types/plans'
import { Button } from '@/components/ui/Button'
import styles from '@/components/admin/AdminCrudPage.module.css'

export function PlanDaysEditor() {
  const [plans, setPlans] = useState<ReadingPlan[]>([])
  const [planId, setPlanId] = useState('')
  const [days, setDays] = useState<ReadingPlanDay[]>([])
  const [title, setTitle] = useState('')
  const [bookId, setBookId] = useState(43)
  const [chapter, setChapter] = useState(1)
  const [verseStart, setVerseStart] = useState('')
  const [verseEnd, setVerseEnd] = useState('')
  const [devotionalText, setDevotionalText] = useState('')

  const books = useBooks('NVI')

  useEffect(() => {
    listPublishedPlans().then(setPlans)
  }, [])

  useEffect(() => {
    if (planId) listPlanDays(planId).then(setDays)
  }, [planId])

  async function handleAdd() {
    if (!planId) return
    const bookName = books.find((b) => b.bookid === bookId)?.name ?? ''
    await addPlanDay(planId, {
      order: days.length + 1,
      title,
      passageRefs: [
        {
          book: bookId,
          bookName,
          chapter,
          ...(verseStart ? { verseStart: Number(verseStart) } : {}),
          ...(verseEnd ? { verseEnd: Number(verseEnd) } : {}),
        },
      ],
      devotionalText,
    })
    setTitle('')
    setVerseStart('')
    setVerseEnd('')
    setDevotionalText('')
    setDays(await listPlanDays(planId))
  }

  return (
    <div className={styles.layout}>
      <h2>Días del plan</h2>
      <div className={styles.form}>
        <label>
          <span>Plan</span>
          <select className={styles.input} value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">Selecciona un plan…</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {planId && (
          <>
            <label>
              <span>Título del día</span>
              <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: El nuevo nacimiento" />
            </label>
            <label>
              <span>Libro</span>
              <select className={styles.input} value={bookId} onChange={(e) => setBookId(Number(e.target.value))}>
                {books.map((b) => (
                  <option key={b.bookid} value={b.bookid}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Capítulo</span>
              <input className={styles.input} type="number" min={1} value={chapter} onChange={(e) => setChapter(Number(e.target.value))} />
            </label>
            <label>
              <span>Versículo inicial (opcional)</span>
              <input className={styles.input} type="number" min={1} value={verseStart} onChange={(e) => setVerseStart(e.target.value)} />
            </label>
            <label>
              <span>Versículo final (opcional)</span>
              <input className={styles.input} type="number" min={1} value={verseEnd} onChange={(e) => setVerseEnd(e.target.value)} />
            </label>
            <label>
              <span>Texto devocional</span>
              <textarea className={styles.textarea} value={devotionalText} onChange={(e) => setDevotionalText(e.target.value)} placeholder="Reflexión que verá el usuario ese día" />
            </label>
            <Button onClick={handleAdd}>Agregar día {days.length + 1}</Button>
          </>
        )}
      </div>
      {days.map((day) => (
        <div key={day.id} className={styles.row}>
          <span>
            Día {day.order}: {day.title} — {formatPassageRefs(day.passageRefs)}
          </span>
        </div>
      ))}
    </div>
  )
}
