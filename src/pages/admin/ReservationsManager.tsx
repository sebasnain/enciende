import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { cancelReservation, fulfillReservation, listPendingReservations, releaseExpiredReservation } from '@/services/library.service'
import type { LibraryReservation } from '@/types/library'
import { Button } from '@/components/ui/Button'
import styles from '@/components/admin/AdminCrudPage.module.css'

const DEFAULT_LOAN_DAYS = 14

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-AR')
}

function toDateInputValue(timestamp: number): string {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function ReservationsManager() {
  const { profile } = useAuth()
  const [reservations, setReservations] = useState<LibraryReservation[] | null>(null)
  const [loanFormId, setLoanFormId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState('')

  async function reload() {
    setReservations(await listPendingReservations())
  }

  useEffect(() => {
    reload()
  }, [])

  const readyForPickup = reservations?.filter((r) => r.status === 'disponible_para_retirar') ?? []
  const waiting = (reservations?.filter((r) => r.status === 'en_espera') ?? []).sort((a, b) => a.requestedAt - b.requestedAt)

  function openLoanForm(reservation: LibraryReservation) {
    setLoanFormId(reservation.id)
    setDueDate(toDateInputValue(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000))
  }

  async function handleFulfill(reservation: LibraryReservation) {
    if (!profile || !dueDate) return
    await fulfillReservation(
      { id: reservation.id, titleId: reservation.titleId },
      {
        titleId: reservation.titleId,
        titleName: reservation.titleName,
        userId: reservation.userId,
        memberName: reservation.memberName,
        librarianId: profile.uid,
        loanDate: Date.now(),
        dueDate: new Date(`${dueDate}T23:59:59`).getTime(),
      },
    )
    setLoanFormId(null)
    await reload()
  }

  async function handleRelease(reservation: LibraryReservation) {
    await releaseExpiredReservation(reservation)
    await reload()
  }

  async function handleCancel(reservation: LibraryReservation) {
    await cancelReservation(reservation.id)
    await reload()
  }

  return (
    <div className={styles.layout}>
      <h2>Listas para retirar {readyForPickup.length ? `(${readyForPickup.length})` : ''}</h2>
      {readyForPickup.length === 0 && (
        <p style={{ color: 'var(--color-ink-400)' }}>No hay ejemplares esperando que los retiren.</p>
      )}
      {readyForPickup.map((r) => (
        <div key={r.id}>
          <div className={styles.row}>
            <span>
              {r.titleName} → {r.memberName}
              <br />
              <span style={{ fontSize: 12, color: 'var(--color-ink-400)' }}>
                Disponible hasta el {r.expiresAt ? formatDate(r.expiresAt) : '—'}
              </span>
            </span>
            <span className={styles.rowActions}>
              <button type="button" className={styles.link} onClick={() => openLoanForm(r)}>
                Prestar
              </button>
              <button type="button" className={styles.link} onClick={() => handleRelease(r)}>
                Venció, liberar
              </button>
            </span>
          </div>
          {loanFormId === r.id && (
            <div className={styles.inlineForm}>
              <label>
                <span>Fecha límite de devolución</span>
                <input className={styles.input} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </label>
              <div className={styles.formActions}>
                <Button type="button" onClick={() => handleFulfill(r)}>
                  Confirmar préstamo
                </Button>
                <Button type="button" variant="ghost" onClick={() => setLoanFormId(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      <h2 style={{ marginTop: 24 }}>En espera {waiting.length ? `(${waiting.length})` : ''}</h2>
      {waiting.length === 0 && <p style={{ color: 'var(--color-ink-400)' }}>Nadie está esperando un título ahora mismo.</p>}
      {waiting.map((r, i) => (
        <div key={r.id} className={styles.row}>
          <span>
            #{i + 1} {r.titleName} → {r.memberName}
          </span>
          <span className={styles.rowActions}>
            <button type="button" className={styles.link} onClick={() => handleCancel(r)}>
              Cancelar
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}
