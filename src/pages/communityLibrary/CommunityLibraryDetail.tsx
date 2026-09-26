import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  cancelReservation,
  getLibraryTitle,
  getMembershipPlan,
  listCopiesByTitle,
  listLoansByUser,
  listReservationsByUser,
  requestReservation,
} from '@/services/library.service'
import { DEFAULT_CONCURRENT_LOAN_LIMIT, isMembershipActive, type LibraryCopy, type LibraryReservation, type LibraryTitle } from '@/types/library'
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
  const [commitmentCount, setCommitmentCount] = useState(0)
  const [loanLimit, setLoanLimit] = useState(DEFAULT_CONCURRENT_LOAN_LIMIT)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [requesting, setRequesting] = useState(false)

  function reloadMyStatus() {
    if (!user) {
      setMyReservation(null)
      setCommitmentCount(0)
      return
    }
    Promise.all([listLoansByUser(user.uid), listReservationsByUser(user.uid)]).then(([loans, reservations]) => {
      const activeLoans = loans.filter((l) => l.status === 'activo')
      const pendingReservations = reservations.filter((r) => r.status === 'en_espera' || r.status === 'disponible_para_retirar')
      setCommitmentCount(activeLoans.length + pendingReservations.length)
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
      if (plan) setLoanLimit(plan.concurrentLoanLimit)
    })
    reloadMyStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleId, user])

  async function handleRequest() {
    if (!user || !profile || !title) return
    setRequesting(true)
    try {
      await requestReservation({ titleId: title.id, titleName: title.title, userId: user.uid, memberName: profile.displayName })
      reloadMyStatus()
      listCopiesByTitle(titleId).then(setCopies)
    } finally {
      setRequesting(false)
    }
  }

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
  const atLimit = commitmentCount >= loanLimit

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

          {user && !myReservation && !membershipInactive && atLimit && (
            <p className={styles.availabilityNone}>
              Ya tenés {commitmentCount} de {loanLimit} libros en uso. Devolvé uno para poder pedir otro.
            </p>
          )}

          {user && !myReservation && !membershipInactive && !atLimit && (
            <>
              <button type="button" className={styles.reserveButton} onClick={handleRequest} disabled={requesting}>
                {requesting ? 'Pidiendo…' : 'Pedir este libro'}
              </button>
              <p style={{ fontSize: 12, color: 'var(--color-ink-400)', margin: 0 }}>
                {available > 0
                  ? 'Te lo dejamos apartado 48hs para que pases a retirarlo.'
                  : 'No hay ejemplares ahora: te anotamos en la lista de espera y te avisamos cuando se libere uno.'}
              </p>
            </>
          )}
        </div>
      )}

      {title.description && <p>{title.description}</p>}
    </article>
  )
}
