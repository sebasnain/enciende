import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  enrollInPlan,
  getPlan,
  getPlanProgress,
  listPlanDays,
  markDayComplete,
} from '@/services/plans.service'
import { touchStreak } from '@/services/streak.service'
import { useAuth } from '@/context/AuthContext'
import type { PlanProgress, ReadingPlan, ReadingPlanDay } from '@/types/plans'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import styles from './PlanDetail.module.css'

export function PlanDetail() {
  const { planId = '' } = useParams()
  const { user, profile, refreshProfile } = useAuth()
  const [plan, setPlan] = useState<ReadingPlan | null>(null)
  const [days, setDays] = useState<ReadingPlanDay[]>([])
  const [progress, setProgress] = useState<PlanProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [planData, dayData] = await Promise.all([getPlan(planId), listPlanDays(planId)])
      setPlan(planData)
      setDays(dayData)
      if (user) setProgress(await getPlanProgress(user.uid, planId))
      setLoading(false)
    }
    load()
  }, [planId, user])

  async function handleEnroll() {
    if (!user) return
    await enrollInPlan(user.uid, planId)
    setProgress(await getPlanProgress(user.uid, planId))
  }

  async function handleCompleteDay(dayId: string) {
    if (!user || !profile) return
    await markDayComplete(user.uid, planId, dayId)
    await touchStreak(user.uid, profile.streak)
    setProgress(await getPlanProgress(user.uid, planId))
    await refreshProfile()
  }

  if (loading) return <Spinner />
  if (!plan) return <p>Plan no encontrado.</p>

  return (
    <div>
      <h1>{plan.title}</h1>
      <p>{plan.description}</p>

      {!progress && user && <Button onClick={handleEnroll}>Inscribirme en este plan</Button>}

      <div style={{ marginTop: 16 }}>
        {days.map((day) => {
          const done = !!progress?.completedDayIds[day.id]
          return (
            <div key={day.id} className={`${styles.day} ${done ? styles.dayDone : ''}`}>
              <span className={styles.dayTitle}>
                Día {day.order}: {day.title}
              </span>
              {progress && !done && (
                <Button variant="secondary" onClick={() => handleCompleteDay(day.id)}>
                  Marcar hecho
                </Button>
              )}
              {done && <Icon name="check-circle-fill" className={styles.doneIcon} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
