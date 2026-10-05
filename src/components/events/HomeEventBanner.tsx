import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getMyRegistration, listActiveSignupEvents } from '@/services/signups.service'
import { spotsLeft, type SignupEvent } from '@/types/signups'
import { Modal } from '@/components/ui/Modal'
import styles from './HomeEventBanner.module.css'

const POPUP_KEY_PREFIX = 'enciende.eventPopup.'

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA')
}

function wasPopupShownToday(eventId: string): boolean {
  try {
    return localStorage.getItem(POPUP_KEY_PREFIX + eventId) === todayKey()
  } catch {
    return false
  }
}

function markPopupShown(eventId: string) {
  try {
    localStorage.setItem(POPUP_KEY_PREFIX + eventId, todayKey())
  } catch {
    // sin localStorage el popup puede repetirse; no es grave
  }
}

function SignupButton({ event, registered }: { event: SignupEvent; registered: boolean }) {
  if (registered) return <span className={`${styles.button} ${styles.done}`}>Ya estás inscripto ✓</span>
  if (spotsLeft(event) === 0) return <span className={`${styles.button} ${styles.done}`}>Cupos agotados</span>
  return (
    <Link to={`/inscripcion/${event.id}`} className={styles.button}>
      Inscribirme
    </Link>
  )
}

/** Banners de eventos con inscripción: solo en el Inicio (el chico, siempre; el grande, una vez por día). */
export function HomeEventBanner() {
  const { user } = useAuth()
  const [events, setEvents] = useState<SignupEvent[]>([])
  const [registered, setRegistered] = useState<Set<string>>(new Set())
  const [popupEvent, setPopupEvent] = useState<SignupEvent | null>(null)

  useEffect(() => {
    let cancelled = false
    listActiveSignupEvents()
      .then(async (active) => {
        if (cancelled) return
        setEvents(active)

        const mine = user
          ? await Promise.all(active.map((e) => getMyRegistration(e.id, user.uid).then((r) => (r ? e.id : null)).catch(() => null)))
          : []
        if (cancelled) return
        const registeredIds = new Set(mine.filter((id): id is string => !!id))
        setRegistered(registeredIds)

        const candidate = active.find(
          (e) => e.popupImageUrl && !registeredIds.has(e.id) && spotsLeft(e) !== 0 && !wasPopupShownToday(e.id),
        )
        if (candidate) {
          markPopupShown(candidate.id)
          setPopupEvent(candidate)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user])

  const withBanner = events.filter((e) => e.bannerImageUrl)

  return (
    <>
      {withBanner.map((event) => (
        <div key={event.id} className={styles.banner}>
          <img src={event.bannerImageUrl} alt={event.title} className={styles.bannerImage} />
          <div className={styles.bannerAction}>
            <SignupButton event={event} registered={registered.has(event.id)} />
          </div>
        </div>
      ))}

      {popupEvent && (
        <Modal title={popupEvent.title} onClose={() => setPopupEvent(null)}>
          <img src={popupEvent.popupImageUrl} alt={popupEvent.title} className={styles.popupImage} />
          <div className={styles.popupAction} onClick={() => setPopupEvent(null)}>
            <SignupButton event={popupEvent} registered={registered.has(popupEvent.id)} />
          </div>
        </Modal>
      )}
    </>
  )
}
