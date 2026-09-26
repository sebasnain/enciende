import { Link } from 'react-router-dom'
import { useLibraryReminders, type LibraryReminderKind } from '@/hooks/useLibraryReminders'
import styles from './LibraryReminderBanner.module.css'

const MESSAGES: Record<LibraryReminderKind, (count: number) => string> = {
  atrasado: (n) => (n === 1 ? 'Tenés un préstamo de biblioteca atrasado' : `Tenés ${n} préstamos de biblioteca atrasados`),
  listo_para_retirar: (n) =>
    n === 1 ? 'Tenés un libro reservado esperando que lo retires' : `Tenés ${n} libros reservados esperando que los retires`,
  por_vencer: (n) => (n === 1 ? 'Un préstamo de biblioteca vence pronto' : `${n} préstamos de biblioteca vencen pronto`),
}

export function LibraryReminderBanner() {
  const reminder = useLibraryReminders()
  if (!reminder) return null

  return (
    <Link to="/biblioteca/mis-prestamos" className={`${styles.banner} ${reminder.kind === 'atrasado' ? styles.urgent : ''}`}>
      {MESSAGES[reminder.kind](reminder.count)} — tocá para ver
    </Link>
  )
}
