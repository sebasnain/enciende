import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { BarcodeScanner } from '@/components/admin/BarcodeScanner'
import { Button } from '@/components/ui/Button'
import { MemberPicker } from './MemberPicker'
import {
  createLoan,
  getLibraryCopy,
  getMembershipPlan,
  listAvailableCopies,
  listLibraryTitles,
  listLoansByUser,
} from '@/services/library.service'
import { parseCopyQrPayload } from '@/utils/libraryQr'
import { DEFAULT_CONCURRENT_LOAN_LIMIT, isMembershipActive, type LibraryCopy, type LibraryTitle } from '@/types/library'
import type { UserProfile } from '@/types/user'
import styles from '@/components/admin/AdminCrudPage.module.css'

const DEFAULT_LOAN_DAYS = 14

function toDateInputValue(timestamp: number): string {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface NewLoanFormProps {
  onCreated: () => void
}

export function NewLoanForm({ onCreated }: NewLoanFormProps) {
  const { profile } = useAuth()
  const [titles, setTitles] = useState<LibraryTitle[]>([])
  const [availableCopies, setAvailableCopies] = useState<LibraryCopy[]>([])
  const [copyId, setCopyId] = useState('')
  const [member, setMember] = useState<UserProfile | null>(null)
  const [memberActiveLoans, setMemberActiveLoans] = useState(0)
  const [loanLimit, setLoanLimit] = useState(DEFAULT_CONCURRENT_LOAN_LIMIT)
  const [dueDate, setDueDate] = useState(toDateInputValue(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000))
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listLibraryTitles().then(setTitles)
    listAvailableCopies().then(setAvailableCopies)
    getMembershipPlan().then((plan) => {
      if (plan) setLoanLimit(plan.concurrentLoanLimit)
    })
  }, [])

  useEffect(() => {
    if (!member) {
      setMemberActiveLoans(0)
      return
    }
    listLoansByUser(member.uid).then((loans) => setMemberActiveLoans(loans.filter((l) => l.status === 'activo').length))
  }, [member])

  function titleNameFor(titleId: string) {
    return titles.find((t) => t.id === titleId)?.title ?? 'Título desconocido'
  }

  async function handleScanned(text: string) {
    setScanning(false)
    const scannedCopyId = parseCopyQrPayload(text)
    if (!scannedCopyId) {
      setError('Ese código no corresponde a un ejemplar de la biblioteca.')
      return
    }
    const copy = await getLibraryCopy(scannedCopyId)
    if (!copy || copy.status !== 'disponible') {
      setError('El ejemplar escaneado no está disponible.')
      return
    }
    setError(null)
    setCopyId(scannedCopyId)
    if (!availableCopies.some((c) => c.id === scannedCopyId)) {
      setAvailableCopies((prev) => [...prev, copy])
    }
  }

  async function handleSubmit() {
    if (!profile || !member || !copyId) return
    const copy = availableCopies.find((c) => c.id === copyId)
    if (!copy) return

    setSaving(true)
    setError(null)
    try {
      await createLoan({
        copyId,
        titleId: copy.titleId,
        titleName: titleNameFor(copy.titleId),
        userId: member.uid,
        memberName: member.displayName,
        librarianId: profile.uid,
        loanDate: Date.now(),
        dueDate: new Date(`${dueDate}T23:59:59`).getTime(),
      })
      setCopyId('')
      setMember(null)
      setDueDate(toDateInputValue(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000))
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el préstamo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.form}>
      <p className={styles.modeNew}>Nuevo préstamo</p>

      <label>
        <span>Ejemplar</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className={styles.input} value={copyId} onChange={(e) => setCopyId(e.target.value)}>
            <option value="">Seleccioná un ejemplar disponible…</option>
            {availableCopies.map((c) => (
              <option key={c.id} value={c.id}>
                {titleNameFor(c.titleId)} — Ejemplar #{c.id.slice(-6)}
              </option>
            ))}
          </select>
          <Button type="button" variant="secondary" onClick={() => setScanning(true)}>
            Escanear
          </Button>
        </div>
      </label>

      <label>
        <span>Miembro</span>
      </label>
      <MemberPicker selected={member} onSelect={setMember} />
      {member && !isMembershipActive(member.libraryMembership) && (
        <p style={{ color: 'var(--color-danger, #c0392b)', fontSize: 13 }}>
          {member.displayName} no tiene una membresía activa. Podés continuar igual si el bibliotecario lo autoriza.
        </p>
      )}
      {member && memberActiveLoans >= loanLimit && (
        <p style={{ color: 'var(--color-danger, #c0392b)', fontSize: 13 }}>
          {member.displayName} ya tiene {memberActiveLoans} préstamos activos (cupo actual: {loanLimit}). Podés continuar igual si el
          bibliotecario lo autoriza.
        </p>
      )}

      <label>
        <span>Fecha límite de devolución</span>
        <input className={styles.input} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <p style={{ fontSize: 12, color: 'var(--color-ink-400)', margin: 0 }}>
        Por defecto son {DEFAULT_LOAN_DAYS} días; para libros más grandes se puede extender a mano.
      </p>

      {error && <p className={styles.saveError}>{error}</p>}

      <div className={styles.formActions}>
        <Button type="button" onClick={handleSubmit} disabled={!member || !copyId || saving}>
          {saving ? 'Guardando…' : 'Registrar préstamo'}
        </Button>
      </div>

      {scanning && (
        <BarcodeScanner title="Escanear ejemplar" onDetected={handleScanned} onClose={() => setScanning(false)} />
      )}
    </div>
  )
}
