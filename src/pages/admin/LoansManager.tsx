import { useEffect, useState } from 'react'
import { createFine, listActiveLoans, markLoanLost, returnLoan } from '@/services/library.service'
import { isLoanOverdue, LIBRARY_FINE_REASONS, type LibraryFineReason, type LibraryLoan } from '@/types/library'
import { Button } from '@/components/ui/Button'
import { NewLoanForm } from './NewLoanForm'
import styles from '@/components/admin/AdminCrudPage.module.css'

const FINE_REASON_LABELS: Record<LibraryFineReason, string> = {
  atraso: 'Atraso',
  perdida: 'Pérdida',
  dano: 'Daño',
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-AR')
}

export function LoansManager() {
  const [loans, setLoans] = useState<LibraryLoan[] | null>(null)
  const [fineFormLoanId, setFineFormLoanId] = useState<string | null>(null)
  const [fineReason, setFineReason] = useState<LibraryFineReason>('atraso')
  const [fineAmount, setFineAmount] = useState('')
  const [fineNotes, setFineNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoans(await listActiveLoans())
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleReturn(loan: LibraryLoan) {
    await returnLoan(loan)
    await reload()
  }

  async function handleLost(loan: LibraryLoan) {
    await markLoanLost(loan)
    await createFine({ userId: loan.userId, loanId: loan.id, reason: 'perdida', amount: null, notes: '' })
    await reload()
  }

  function openFineForm(loan: LibraryLoan, reason: LibraryFineReason) {
    setFineFormLoanId(loan.id)
    setFineReason(reason)
    setFineAmount('')
    setFineNotes('')
  }

  async function handleSaveFine(loan: LibraryLoan) {
    setSaving(true)
    try {
      await createFine({
        userId: loan.userId,
        loanId: loan.id,
        reason: fineReason,
        amount: fineAmount ? Number(fineAmount) : null,
        notes: fineNotes,
      })
      setFineFormLoanId(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.layout}>
      <NewLoanForm onCreated={reload} />

      <h2 style={{ marginTop: 24 }}>Préstamos activos {loans ? `(${loans.length})` : ''}</h2>

      {!loans && <p style={{ color: 'var(--color-ink-400)' }}>Cargando…</p>}
      {loans?.length === 0 && <p style={{ color: 'var(--color-ink-400)' }}>No hay préstamos activos.</p>}

      {loans?.map((loan) => {
        const overdue = isLoanOverdue(loan)
        return (
          <div key={loan.id}>
            <div className={styles.row}>
              <span>
                {loan.titleName} → {loan.memberName}
                <br />
                <span style={{ fontSize: 12, color: overdue ? 'var(--color-danger, #c0392b)' : 'var(--color-ink-400)' }}>
                  Vence el {formatDate(loan.dueDate)} {overdue && '· ATRASADO'}
                </span>
              </span>
              <span className={styles.rowActions}>
                <button type="button" className={styles.link} onClick={() => handleReturn(loan)}>
                  Marcar devuelto
                </button>
                <button type="button" className={styles.link} onClick={() => handleLost(loan)}>
                  Marcar extraviado
                </button>
                <button type="button" className={styles.link} onClick={() => openFineForm(loan, overdue ? 'atraso' : 'dano')}>
                  Registrar multa
                </button>
              </span>
            </div>

            {fineFormLoanId === loan.id && (
              <div className={styles.inlineForm}>
                <label>
                  <span>Motivo</span>
                  <select
                    className={styles.input}
                    value={fineReason}
                    onChange={(e) => setFineReason(e.target.value as LibraryFineReason)}
                  >
                    {LIBRARY_FINE_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {FINE_REASON_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Monto (opcional, se cobra fuera de la app)</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(e.target.value)}
                  />
                </label>
                <label>
                  <span>Notas (opcional)</span>
                  <textarea className={styles.textarea} value={fineNotes} onChange={(e) => setFineNotes(e.target.value)} />
                </label>
                <div className={styles.formActions}>
                  <Button type="button" onClick={() => handleSaveFine(loan)} disabled={saving}>
                    Guardar multa
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setFineFormLoanId(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
