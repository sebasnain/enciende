import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { listLoansByUser, listReservationsByUser } from '@/services/library.service'
import { isLoanOverdue } from '@/types/library'

const DUE_SOON_WINDOW_MS = 2 * 24 * 60 * 60 * 1000
const REFRESH_INTERVAL_MS = 5 * 60_000

export type LibraryReminderKind = 'atrasado' | 'listo_para_retirar' | 'por_vencer'

export interface LibraryReminder {
  kind: LibraryReminderKind
  count: number
}

/** Recordatorios de biblioteca sin backend: se recalculan en el cliente comparando fechas con "ahora". */
export function useLibraryReminders(): LibraryReminder | null {
  const { user } = useAuth()
  const [reminder, setReminder] = useState<LibraryReminder | null>(null)

  useEffect(() => {
    if (!user) {
      setReminder(null)
      return
    }
    const uid = user.uid
    let cancelled = false

    async function load() {
      const [loans, reservations] = await Promise.all([listLoansByUser(uid), listReservationsByUser(uid)])
      if (cancelled) return

      const active = loans.filter((l) => l.status === 'activo')
      const overdue = active.filter((l) => isLoanOverdue(l))
      const dueSoon = active.filter((l) => !isLoanOverdue(l) && l.dueDate - Date.now() <= DUE_SOON_WINDOW_MS)
      const readyToPickup = reservations.filter((r) => r.status === 'disponible_para_retirar')

      if (overdue.length > 0) setReminder({ kind: 'atrasado', count: overdue.length })
      else if (readyToPickup.length > 0) setReminder({ kind: 'listo_para_retirar', count: readyToPickup.length })
      else if (dueSoon.length > 0) setReminder({ kind: 'por_vencer', count: dueSoon.length })
      else setReminder(null)
    }

    load()
    const interval = setInterval(load, REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user])

  return reminder
}
