import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getActivePlanProgress, type ActivePlanProgress } from '@/services/plans.service'
import { getTodayEvent } from '@/services/events.service'
import { getSocialSettings } from '@/services/live.service'
import type { ChurchEvent } from '@/types/events'
import type { SocialSettings } from '@/types/products'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import planBg from '@/assets/home/plan.jpg'
import activityBg from '@/assets/home/activity.jpg'
import studiesBg from '@/assets/home/studies.jpg'
import devotionalBg from '@/assets/home/devotional.jpg'
import styles from './Home.module.css'

export function Home() {
  const { user } = useAuth()
  const [activePlan, setActivePlan] = useState<ActivePlanProgress | null>(null)
  const [todayEvent, setTodayEvent] = useState<ChurchEvent | null>(null)
  const [social, setSocial] = useState<SocialSettings | null>(null)

  useEffect(() => {
    getTodayEvent().then(setTodayEvent)
    getSocialSettings().then(setSocial)
  }, [])

  useEffect(() => {
    if (!user) {
      setActivePlan(null)
      return
    }
    getActivePlanProgress(user.uid).then(setActivePlan)
  }, [user])

  const completedCount = activePlan ? Object.keys(activePlan.progress.completedDayIds).length : 0
  const hasSocial = social && (social.facebook || social.instagram || social.youtube)
  const planImage = activePlan?.plan.coverImage || planBg

  return (
    <div className={styles.page}>
      <Link
        to={activePlan ? `/planes/${activePlan.plan.id}` : '/planes'}
        className={styles.planCard}
        style={{ backgroundImage: `url(${planImage})` }}
      >
        <div className={styles.planOverlay} />
        <div className={styles.planContent}>
          <p className={styles.planTitle}>{activePlan ? activePlan.plan.title : 'Explora los planes de lectura'}</p>
          <div className={styles.planMeta}>
            {activePlan && (
              <span className={styles.planChip}>
                {completedCount > 0 && <Icon name="check-circle-fill" />}
                {completedCount > 0 ? 'Al día' : 'Recién empezás'}
              </span>
            )}
            {activePlan && (
              <span className={styles.planProgress}>
                {completedCount}/{activePlan.plan.durationDays}
              </span>
            )}
          </div>
          {activePlan && <ProgressBar value={completedCount} max={activePlan.plan.durationDays} className={styles.planBar} />}
        </div>
        <Icon name="chevron-right" className={styles.planChevron} />
      </Link>

      {hasSocial && (
        <div className={styles.socialRow}>
          {social?.facebook && (
            <a href={social.facebook} target="_blank" rel="noreferrer" className={`${styles.socialIcon} ${styles.facebook}`}>
              <Icon name="facebook" />
            </a>
          )}
          {social?.instagram && (
            <a href={social.instagram} target="_blank" rel="noreferrer" className={`${styles.socialIcon} ${styles.instagram}`}>
              <Icon name="instagram" />
            </a>
          )}
          {social?.youtube && (
            <a href={social.youtube} target="_blank" rel="noreferrer" className={`${styles.socialIcon} ${styles.youtube}`}>
              <Icon name="youtube" />
              <span>YouTube</span>
            </a>
          )}
        </div>
      )}

      <Link to="/cronograma" className={styles.activityCard} style={{ backgroundImage: `url(${activityBg})` }}>
        <div className={styles.activityOverlay} />
        <div className={styles.activityContent}>
          <p className={styles.activityTitle}>Actividad para hoy</p>
          <p className={styles.activitySubtitle}>{todayEvent ? todayEvent.title : 'Sin actividad'}</p>
        </div>
        <span className={styles.activityButton}>Ver más</span>
      </Link>

      <div className={styles.miniGrid}>
        <Link to="/estudios" className={styles.miniCard} style={{ backgroundImage: `url(${studiesBg})` }}>
          <div className={styles.miniOverlay} />
          <span className={styles.miniLabel}>
            <Icon name="pencil-square" /> Estudios
          </span>
        </Link>
        <Link to="/devocionales" className={styles.miniCard} style={{ backgroundImage: `url(${devotionalBg})` }}>
          <div className={styles.miniOverlay} />
          <span className={styles.miniLabel}>Devocional</span>
        </Link>
      </div>
    </div>
  )
}
