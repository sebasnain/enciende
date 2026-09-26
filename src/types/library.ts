export const LIBRARY_COPY_STATUSES = ['disponible', 'prestado', 'reservado', 'extraviado', 'fuera_de_circulacion'] as const
export type LibraryCopyStatus = (typeof LIBRARY_COPY_STATUSES)[number]

export const LIBRARY_COPY_CONDITIONS = ['nuevo', 'bueno', 'usado', 'dañado'] as const
export type LibraryCopyCondition = (typeof LIBRARY_COPY_CONDITIONS)[number]

export const LIBRARY_LOAN_STATUSES = ['activo', 'devuelto', 'atrasado', 'perdido'] as const
export type LibraryLoanStatus = (typeof LIBRARY_LOAN_STATUSES)[number]

export const LIBRARY_RESERVATION_STATUSES = [
  'en_espera',
  'disponible_para_retirar',
  'retirado',
  'cancelado',
  'expirado',
] as const
export type LibraryReservationStatus = (typeof LIBRARY_RESERVATION_STATUSES)[number]

export const LIBRARY_MEMBERSHIP_STATUSES = ['activa', 'vencida', 'sin_membresia'] as const
export type LibraryMembershipStatus = (typeof LIBRARY_MEMBERSHIP_STATUSES)[number]

export const LIBRARY_FINE_REASONS = ['atraso', 'perdida', 'dano'] as const
export type LibraryFineReason = (typeof LIBRARY_FINE_REASONS)[number]

export const LIBRARY_FINE_STATUSES = ['pendiente', 'pagada', 'condonada'] as const
export type LibraryFineStatus = (typeof LIBRARY_FINE_STATUSES)[number]

// Hoy hay una única membresía con cupo de 2 libros simultáneos, en este documento fijo. Si en el futuro hay
// varios planes, esto pasa a ser el id de uno más entre varios en vez de "el" plan.
export const DEFAULT_MEMBERSHIP_PLAN_ID = 'default'
export const DEFAULT_CONCURRENT_LOAN_LIMIT = 2

export const RESERVATION_PICKUP_WINDOW_MS = 48 * 60 * 60 * 1000

export interface LibraryTitle {
  id: string
  isbn: string | null
  title: string
  author: string
  publisher: string
  category: string
  description: string
  coverImageUrl: string
  createdAt: number
}

export interface LibraryCopy {
  id: string
  titleId: string
  status: LibraryCopyStatus
  condition: LibraryCopyCondition
  notes: string
  acquiredAt: number
}

export interface LibraryLoan {
  id: string
  copyId: string
  titleId: string
  titleName: string
  userId: string
  memberName: string
  librarianId: string
  loanDate: number
  dueDate: number
  returnDate: number | null
  /** No hay tarea programada que actualice esto: "atrasado" se calcula en el cliente (ver isLoanOverdue) comparando dueDate con hoy. */
  status: LibraryLoanStatus
  renewalCount: number
}

/** El estado "atrasado" no se guarda: un préstamo activo pasa a mostrarse como atrasado apenas se vence la fecha límite. */
export function isLoanOverdue(loan: Pick<LibraryLoan, 'status' | 'dueDate'>): boolean {
  return loan.status === 'activo' && loan.dueDate < Date.now()
}

export interface LibraryReservation {
  id: string
  titleId: string
  titleName: string
  userId: string
  memberName: string
  requestedAt: number
  status: LibraryReservationStatus
  availableAt: number | null
  expiresAt: number | null
}

/** Por ahora existe una única membresía; se modela como colección para poder sumar planes más adelante sin migrar datos. */
export interface LibraryMembershipPlan {
  id: string
  name: string
  concurrentLoanLimit: number
  price: number
  description: string
}

export interface LibraryMembership {
  planId: string
  status: LibraryMembershipStatus
  renewalDate: number | null
}

/** "vencida" no se recalcula solo: una membresía activa deja de contar como vigente en cuanto pasa su renewalDate. */
export function isMembershipActive(membership: LibraryMembership | undefined, now = Date.now()): boolean {
  if (!membership || membership.status !== 'activa') return false
  return membership.renewalDate === null || membership.renewalDate > now
}

/** Cubre atrasos, pérdidas y daños: el monto y la resolución se manejan manualmente (WhatsApp), esto solo deja registro. */
export interface LibraryFine {
  id: string
  userId: string
  loanId: string | null
  reason: LibraryFineReason
  amount: number | null
  status: LibraryFineStatus
  notes: string
  createdAt: number
}
