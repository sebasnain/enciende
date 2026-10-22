import { SafeImage } from '@/components/ui/SafeImage'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  cancelReservation,
  getLibraryTitle,
  getMembershipPlan,
  listCopiesByTitle,
  listReservationsByUser,
} from '@/services/library.service'
import { isMembershipActive, type LibraryCopy, type LibraryReservation, type LibraryTitle } from '@/types/library'
import { Spinner } from '@/components/ui/Spinner'
import { MembershipRequestButton } from './MembershipRequestButton'
import styles from './CommunityLibrary.module.css'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-AR')
}

export function CommunityLibraryDetail() {
  const { titleId = '' } = useParams()
  const { user, profile } = useAuth()
  const [title, setTitle] = useState<LibraryTitle | null>(null)
  const [copies, setCopies] = useState<LibraryCopy[]>([])
  const [myReservation, setMyReservation] = useState<LibraryReservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')

  function reloadMyStatus() {
    if (!user) {
      setMyReservation(null)
      return
    }
    listReservationsByUser(user.uid).then((reservations) => {
      const pendingReservations = reservations.filter((r) => r.status === 'en_espera' || r.status === 'disponible_para_retirar')
      setMyReservation(pendingReservations.find((r) => r.titleId === titleId) ?? null)
    })
  }

  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    Promise.all([getLibraryTitle(titleId), listCopiesByTitle(titleId)])
      .then(([t, c]) => {
        setTitle(t)
        setCopies(c)
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
    getMembershipPlan().then((plan) => {
      if (plan) {
        setWhatsappNumber(plan.whatsappNumber ?? '')
      }
    })
    reloadMyStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleId, user])

  async function handleCancelReservation() {
    if (!myReservation) return
    setRequesting(true)
    try {
      await cancelReservation(myReservation.id)
      setMyReservation(null)
    } finally {
      setRequesting(false)
    }
  }

  if (loading) return <Spinner />
  if (loadError) return <p>No se pudo cargar este título. Probá de nuevo en un momento.</p>
  if (!title) return <p>No encontramos ese título.</p>

  const available = copies.filter((c) => c.status === 'disponible').length
  const membershipInactive = !isMembershipActive(profile?.libraryMembership)
  const whatsappHref =
    whatsappNumber && profile
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          `Hola! Soy ${profile.displayName} y quiero solicitar el libro "${title.title}" de la biblioteca de Enciende.`,
        )}`
      : null

  return (
    <article>
      {title.coverImageUrl && <SafeImage src={title.coverImageUrl} alt="" className={styles.detailCover} />}
      <h1>{title.title}</h1>
      <p style={{ color: 'var(--color-ink-400)' }}>
        {title.author}
        {title.publisher ? ` · ${title.publisher}` : ''}
      </p>
      {title.category && <span className={styles.detailCategoryChip}>{title.category}</span>}

      <p className={available > 0 ? styles.availabilityOk : styles.availabilityNone}>
        {copies.length === 0
          ? 'Todavía no hay ejemplares cargados.'
          : available > 0
            ? `${available} de ${copies.length} ejemplares disponibles`
            : 'Prestado: no hay ejemplares disponibles por ahora'}
      </p>

      {user && whatsappHref && !membershipInactive && (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.reserveButton} style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
          Solicitar por WhatsApp
        </a>
      )}
      {user && whatsappHref && membershipInactive && (
        <>
          <p className={styles.availabilityNone}>Necesitás una membresía activa para solicitar libros.</p>
          <MembershipRequestButton />
        </>
      )}

      {copies.length > 0 && (
        <div>
          {!user && (
            <p className={styles.reserveStatus}>
              <Link to="/bienvenida">Iniciá sesión</Link> para pedir este título.
            </p>
          )}

          {user && myReservation?.status === 'disponible_para_retirar' && (
            <p className={styles.reserveStatus}>
              ¡Ya podés retirarlo! Pasá antes del {myReservation.expiresAt ? formatDate(myReservation.expiresAt) : ''}.
            </p>
          )}

          {user && myReservation?.status === 'en_espera' && (
            <p className={styles.reserveStatus}>
              Ya estás en la lista de espera.{' '}
              <button type="button" className={styles.inlineLink} onClick={handleCancelReservation} disabled={requesting}>
                Cancelar
              </button>
            </p>
          )}

          {user && !myReservation && membershipInactive && (
            <p className={styles.availabilityNone}>Necesitás una membresía activa para pedir libros. Hablá con el bibliotecario.</p>
          )}
        </div>
      )}

      {title.description && <p>{title.description}</p>}
    </article>
  )
}
