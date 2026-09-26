import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { cancelReservation, getMembershipPlan, listLoansByUser, listReservationsByUser } from '@/services/library.service'
import { DEFAULT_CONCURRENT_LOAN_LIMIT, isLoanOverdue, type LibraryLoan, type LibraryReservation } from '@/types/library'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './CommunityLibrary.module.css'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-AR')
}

export function MyLoans() {
  const { user } = useAuth()
  const [loans, setLoans] = useState<LibraryLoan[] | null>(null)
  const [reservations, setReservations] = useState<LibraryReservation[]>([])
  const [loanLimit, setLoanLimit] = useState(DEFAULT_CONCURRENT_LOAN_LIMIT)
  const [loadError, setLoadError] = useState(false)

  function reloadReservations() {
    if (user) listReservationsByUser(user.uid).then(setReservations)
  }

  useEffect(() => {
    if (!user) return
    listLoansByUser(user.uid)
      .then(setLoans)
      .catch(() => setLoadError(true))
    reloadReservations()
    getMembershipPlan().then((plan) => {
      if (plan) setLoanLimit(plan.concurrentLoanLimit)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleCancel(reservationId: string) {
    await cancelReservation(reservationId)
    reloadReservations()
  }

  if (loadError) return <EmptyState message="No se pudieron cargar tus préstamos. Probá de nuevo en un momento." />
  if (!loans) return <Spinner />

  const active = loans.filter((l) => l.status === 'activo')
  const history = loans.filter((l) => l.status !== 'activo').sort((a, b) => b.loanDate - a.loanDate)
  const pendingReservations = reservations.filter((r) => r.status === 'en_espera' || r.status === 'disponible_para_retirar')
  const commitmentCount = active.length + pendingReservations.length

  return (
    <div>
      <h1>Mis préstamos</h1>
      <p className={styles.summary}>
        {commitmentCount} de {loanLimit} en uso (préstamos activos + reservas pendientes).
      </p>

      {active.length === 0 ? (
        <EmptyState message="No tenés préstamos activos." />
      ) : (
        active.map((loan) => {
          const overdue = isLoanOverdue(loan)
          return (
            <div key={loan.id} className={styles.loanRow}>
              <span>{loan.titleName}</span>
              <span className={overdue ? styles.overdue : styles.dueDate}>
                {overdue ? 'Atrasado, vencía el' : 'Vence el'} {formatDate(loan.dueDate)}
              </span>
            </div>
          )
        })
      )}

      {pendingReservations.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Mis reservas</h2>
          {pendingReservations.map((r) => (
            <div key={r.id} className={styles.loanRow}>
              <span>{r.titleName}</span>
              <span className={r.status === 'disponible_para_retirar' ? styles.availabilityOk : styles.dueDate}>
                {r.status === 'disponible_para_retirar'
                  ? `¡Ya podés retirarlo! Pasá antes del ${r.expiresAt ? formatDate(r.expiresAt) : ''}`
                  : 'En lista de espera'}
                {' · '}
                <button type="button" className={styles.inlineLink} onClick={() => handleCancel(r.id)}>
                  Cancelar
                </button>
              </span>
            </div>
          ))}
        </>
      )}

      {history.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Historial</h2>
          {history.map((loan) => (
            <div key={loan.id} className={styles.loanRow}>
              <span>{loan.titleName}</span>
              <span style={{ color: 'var(--color-ink-400)', fontSize: 13, fontWeight: 600 }}>
                {loan.status === 'perdido' ? 'Extraviado' : `Devuelto el ${loan.returnDate ? formatDate(loan.returnDate) : ''}`}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
