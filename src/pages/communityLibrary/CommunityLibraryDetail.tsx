import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cancelReservation, createReservation, getLibraryTitle, listCopiesByTitle, listReservationsByUser } from '@/services/library.service'
import type { LibraryCopy, LibraryReservation, LibraryTitle } from '@/types/library'
import { Spinner } from '@/components/ui/Spinner'
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
  const [reserving, setReserving] = useState(false)

  function reloadMyReservation() {
    if (!user) {
      setMyReservation(null)
      return
    }
    listReservationsByUser(user.uid).then((reservations) => {
      const pending = reservations.find(
        (r) => r.titleId === titleId && (r.status === 'en_espera' || r.status === 'disponible_para_retirar'),
      )
      setMyReservation(pending ?? null)
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
    reloadMyReservation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleId, user])

  async function handleReserve() {
    if (!user || !profile || !title) return
    setReserving(true)
    try {
      await createReservation({ titleId: title.id, titleName: title.title, userId: user.uid, memberName: profile.displayName })
      reloadMyReservation()
    } finally {
      setReserving(false)
    }
  }

  async function handleCancelReservation() {
    if (!myReservation) return
    setReserving(true)
    try {
      await cancelReservation(myReservation.id)
      setMyReservation(null)
    } finally {
      setReserving(false)
    }
  }

  if (loading) return <Spinner />
  if (loadError) return <p>No se pudo cargar este título. Probá de nuevo en un momento.</p>
  if (!title) return <p>No encontramos ese título.</p>

  const available = copies.filter((c) => c.status === 'disponible').length

  return (
    <article>
      {title.coverImageUrl && <img src={title.coverImageUrl} alt="" className={styles.detailCover} />}
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
            : 'Sin ejemplares disponibles por ahora'}
      </p>

      {copies.length > 0 && available === 0 && (
        <div>
          {!user && (
            <p className={styles.reserveStatus}>
              <Link to="/bienvenida">Iniciá sesión</Link> para reservar este título.
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
              <button type="button" className={styles.inlineLink} onClick={handleCancelReservation} disabled={reserving}>
                Cancelar reserva
              </button>
            </p>
          )}
          {user && !myReservation && (
            <button type="button" className={styles.reserveButton} onClick={handleReserve} disabled={reserving}>
              {reserving ? 'Reservando…' : 'Reservar este libro'}
            </button>
          )}
        </div>
      )}

      {title.description && <p>{title.description}</p>}
    </article>
  )
}
