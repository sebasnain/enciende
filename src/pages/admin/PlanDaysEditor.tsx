import { useEffect, useState } from 'react'
import { addPlanDay, listPlanDays, listPublishedPlans } from '@/services/plans.service'
import type { ReadingPlan, ReadingPlanDay } from '@/types/plans'
import { Button } from '@/components/ui/Button'
import styles from '@/components/admin/AdminCrudPage.module.css'

export function PlanDaysEditor() {
  const [plans, setPlans] = useState<ReadingPlan[]>([])
  const [planId, setPlanId] = useState('')
  const [days, setDays] = useState<ReadingPlanDay[]>([])
  const [title, setTitle] = useState('')
  const [book, setBook] = useState(43)
  const [chapter, setChapter] = useState(1)
  const [devotionalText, setDevotionalText] = useState('')

  useEffect(() => {
    listPublishedPlans().then(setPlans)
  }, [])

  useEffect(() => {
    if (planId) listPlanDays(planId).then(setDays)
  }, [planId])

  async function handleAdd() {
    if (!planId) return
    await addPlanDay(planId, {
      order: days.length + 1,
      title,
      passageRefs: [{ book, bookName: '', chapter }],
      devotionalText,
    })
    setTitle('')
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
              <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              <span>Libro (número Bolls.life)</span>
              <input className={styles.input} type="number" value={book} onChange={(e) => setBook(Number(e.target.value))} />
            </label>
            <label>
              <span>Capítulo</span>
              <input className={styles.input} type="number" value={chapter} onChange={(e) => setChapter(Number(e.target.value))} />
            </label>
            <label>
              <span>Texto devocional</span>
              <textarea className={styles.textarea} value={devotionalText} onChange={(e) => setDevotionalText(e.target.value)} />
            </label>
            <Button onClick={handleAdd}>Agregar día {days.length + 1}</Button>
          </>
        )}
      </div>
      {days.map((day) => (
        <div key={day.id} className={styles.row}>
          <span>
            Día {day.order}: {day.title}
          </span>
        </div>
      ))}
    </div>
  )
}
