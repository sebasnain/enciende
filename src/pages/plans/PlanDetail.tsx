import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  enrollInPlan,
  getPlan,
  getPlanProgress,
  listPlanDays,
  setDayComplete,
} from '@/services/plans.service'
import { touchStreak } from '@/services/streak.service'
import { useAuth } from '@/context/AuthContext'
import { useBiblePosition } from '@/context/BibleContext'
import { buildPassageRoute, formatPassageRefs } from '@/utils/passage'
import type { PlanProgress, ReadingPlan, ReadingPlanDay } from '@/types/plans'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import styles from './PlanDetail.module.css'

export function PlanDetail() {
  const { planId = '' } = useParams()
  const { user, profile, refreshProfile } = useAuth()
  const { position, setPosition } = useBiblePosition()
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

  async function handleToggleDay(dayId: string, done: boolean) {
    if (!user || !profile) return
    await setDayComplete(user.uid, planId, dayId, !done)
    setProgress(await getPlanProgress(user.uid, planId))
    if (!done) await touchStreak(user.uid, profile.streak)
    await refreshProfile()
  }

  if (loading) return <Spinner />
  if (!plan) return <p>Plan no encontrado.</p>

  const completedCount = progress ? Object.keys(progress.completedDayIds).length : 0

  return (
    <div>
      <h1>{plan.title}</h1>
      <p>{plan.description}</p>

      {progress && (
        <div className={styles.progressBlock}>
          <div className={styles.progressLabel}>
            <span>Progreso</span>
            <span>
              {completedCount}/{plan.durationDays} días
            </span>
          </div>
          <ProgressBar value={completedCount} max={plan.durationDays} variant="light" />
        </div>
      )}

      {!progress && user && <Button onClick={handleEnroll}>Inscribirme en este plan</Button>}

      <div style={{ marginTop: 16 }}>
        {days.map((day) => {
          const done = !!progress?.completedDayIds[day.id]
          return (
            <div key={day.id} className={`${styles.day} ${done ? styles.dayDone : ''}`}>
              <div className={styles.dayHeader}>
                <button
                  type="button"
                  className={styles.checkbox}
                  onClick={() => handleToggleDay(day.id, done)}
                  disabled={!progress}
                  aria-label={done ? 'Marcar como no leído' : 'Marcar como leído'}
                >
                  {done && <Icon name="check-lg" />}
                </button>
                <div>
                  <p className={styles.dayTitle}>
                    Día {day.order}: {day.title}
                  </p>
                  {day.passageRefs.length > 0 && (
                    <p className={styles.dayPassage}>
                      {day.passageRefs.map((ref, i) => (
                        <span key={i}>
                          {i > 0 && '; '}
                          <Link
                            to={buildPassageRoute(ref, position.translation)}
                            className={styles.dayPassageLink}
                            onClick={() => setPosition({ translation: position.translation, book: ref.book, chapter: ref.chapter })}
                          >
                            {formatPassageRefs([ref])}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
              {day.devotionalText && <p className={styles.dayText}>{day.devotionalText}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
