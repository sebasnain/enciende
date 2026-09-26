import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import {
  DEFAULT_MEMBERSHIP_PLAN_ID,
  RESERVATION_PICKUP_WINDOW_MS,
  type LibraryCopy,
  type LibraryFine,
  type LibraryLoan,
  type LibraryMembershipPlan,
  type LibraryReservation,
  type LibraryTitle,
} from '@/types/library'

const titlesRef = collection(db, 'libraryTitles')
const copiesRef = collection(db, 'libraryCopies')
const loansRef = collection(db, 'libraryLoans')
const finesRef = collection(db, 'libraryFines')
const reservationsRef = collection(db, 'libraryReservations')
const membershipPlansRef = collection(db, 'libraryMembershipPlans')

export async function listLibraryTitles(): Promise<LibraryTitle[]> {
  const snap = await getDocs(query(titlesRef, orderBy('title')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryTitle)
}

export async function getLibraryTitle(titleId: string): Promise<LibraryTitle | null> {
  const snap = await getDoc(doc(titlesRef, titleId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as LibraryTitle) : null
}

export async function createLibraryTitle(title: Omit<LibraryTitle, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(titlesRef, { ...title, createdAt: Date.now() })
  return docRef.id
}

export async function updateLibraryTitle(titleId: string, patch: Partial<LibraryTitle>) {
  await updateDoc(doc(titlesRef, titleId), patch)
}

export async function deleteLibraryTitle(titleId: string) {
  await deleteDoc(doc(titlesRef, titleId))
}

export async function listCopiesByTitle(titleId: string): Promise<LibraryCopy[]> {
  const snap = await getDocs(query(copiesRef, where('titleId', '==', titleId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryCopy)
}

export async function getLibraryCopy(copyId: string): Promise<LibraryCopy | null> {
  const snap = await getDoc(doc(copiesRef, copyId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as LibraryCopy) : null
}

export async function createLibraryCopy(copy: Omit<LibraryCopy, 'id'>): Promise<string> {
  const docRef = await addDoc(copiesRef, copy)
  return docRef.id
}

export async function updateLibraryCopy(copyId: string, patch: Partial<LibraryCopy>) {
  await updateDoc(doc(copiesRef, copyId), patch)
}

export async function deleteLibraryCopy(copyId: string) {
  await deleteDoc(doc(copiesRef, copyId))
}

export async function listAvailableCopies(): Promise<LibraryCopy[]> {
  const snap = await getDocs(query(copiesRef, where('status', '==', 'disponible')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryCopy)
}

/** Trae todos los ejemplares de una vez para calcular disponibilidad por título en el catálogo, sin una query por título. */
export async function listAllCopies(): Promise<LibraryCopy[]> {
  const snap = await getDocs(copiesRef)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryCopy)
}

export async function listActiveLoans(): Promise<LibraryLoan[]> {
  const snap = await getDocs(query(loansRef, where('status', '==', 'activo')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryLoan)
}

export async function listLoansByUser(userId: string): Promise<LibraryLoan[]> {
  const snap = await getDocs(query(loansRef, where('userId', '==', userId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryLoan)
}

export async function listLoansByCopy(copyId: string): Promise<LibraryLoan[]> {
  const snap = await getDocs(query(loansRef, where('copyId', '==', copyId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryLoan)
}

/** Registra el préstamo y marca el ejemplar como prestado en una sola operación atómica. */
export async function createLoan(
  loan: Omit<LibraryLoan, 'id' | 'status' | 'returnDate' | 'renewalCount'>,
): Promise<string> {
  const batch = writeBatch(db)
  const loanDocRef = doc(loansRef)
  batch.set(loanDocRef, { ...loan, status: 'activo', returnDate: null, renewalCount: 0 })
  batch.update(doc(copiesRef, loan.copyId), { status: 'prestado' })
  await batch.commit()
  return loanDocRef.id
}

/** El siguiente en la fila de espera para un título (el más antiguo primero), o null si no hay nadie esperando. */
async function nextWaitingReservation(titleId: string): Promise<LibraryReservation | null> {
  const snap = await getDocs(query(reservationsRef, where('titleId', '==', titleId)))
  const waiting = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as LibraryReservation)
    .filter((r) => r.status === 'en_espera')
    .sort((a, b) => a.requestedAt - b.requestedAt)
  return waiting[0] ?? null
}

/**
 * Cierra el préstamo y libera el ejemplar en una sola operación atómica. Si hay alguien esperando ese título,
 * el ejemplar queda reservado para esa persona en vez de volver a "disponible".
 */
export async function returnLoan(loan: Pick<LibraryLoan, 'id' | 'copyId' | 'titleId'>) {
  const next = await nextWaitingReservation(loan.titleId)

  const batch = writeBatch(db)
  batch.update(doc(loansRef, loan.id), { status: 'devuelto', returnDate: Date.now() })
  if (next) {
    batch.update(doc(copiesRef, loan.copyId), { status: 'reservado' })
    batch.update(doc(reservationsRef, next.id), {
      status: 'disponible_para_retirar',
      availableAt: Date.now(),
      expiresAt: Date.now() + RESERVATION_PICKUP_WINDOW_MS,
    })
  } else {
    batch.update(doc(copiesRef, loan.copyId), { status: 'disponible' })
  }
  await batch.commit()
}

/** Marca el préstamo como perdido y saca el ejemplar de circulación en una sola operación atómica. */
export async function markLoanLost(loan: Pick<LibraryLoan, 'id' | 'copyId'>) {
  const batch = writeBatch(db)
  batch.update(doc(loansRef, loan.id), { status: 'perdido' })
  batch.update(doc(copiesRef, loan.copyId), { status: 'extraviado' })
  await batch.commit()
}

export async function createFine(fine: Omit<LibraryFine, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const docRef = await addDoc(finesRef, { ...fine, status: 'pendiente', createdAt: Date.now() })
  return docRef.id
}

export async function listFinesByUser(userId: string): Promise<LibraryFine[]> {
  const snap = await getDocs(query(finesRef, where('userId', '==', userId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryFine)
}

export async function getMembershipPlan(planId: string = DEFAULT_MEMBERSHIP_PLAN_ID): Promise<LibraryMembershipPlan | null> {
  const snap = await getDoc(doc(membershipPlansRef, planId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as LibraryMembershipPlan) : null
}

export async function setMembershipPlan(plan: Omit<LibraryMembershipPlan, 'id'>, planId: string = DEFAULT_MEMBERSHIP_PLAN_ID) {
  await setDoc(doc(membershipPlansRef, planId), plan)
}

/**
 * Pedido de un miembro: si hay un ejemplar disponible ahora, lo aparta directo (48hs para retirarlo, igual que
 * cuando se libera uno por una devolución); si no, lo anota en la lista de espera. Atómico para que dos personas
 * no se lleven el mismo ejemplar "disponible" al mismo tiempo.
 */
export async function requestReservation(
  reservation: Pick<LibraryReservation, 'titleId' | 'titleName' | 'userId' | 'memberName'>,
): Promise<LibraryReservation['status']> {
  const availableSnap = await getDocs(query(copiesRef, where('titleId', '==', reservation.titleId), where('status', '==', 'disponible')))
  const availableCopy = availableSnap.docs[0]

  const batch = writeBatch(db)
  const reservationDocRef = doc(reservationsRef)

  if (availableCopy) {
    batch.set(reservationDocRef, {
      ...reservation,
      requestedAt: Date.now(),
      status: 'disponible_para_retirar',
      availableAt: Date.now(),
      expiresAt: Date.now() + RESERVATION_PICKUP_WINDOW_MS,
    })
    batch.update(doc(copiesRef, availableCopy.id), { status: 'reservado' })
    await batch.commit()
    return 'disponible_para_retirar'
  }

  batch.set(reservationDocRef, {
    ...reservation,
    requestedAt: Date.now(),
    status: 'en_espera',
    availableAt: null,
    expiresAt: null,
  })
  await batch.commit()
  return 'en_espera'
}

export async function listReservationsByUser(userId: string): Promise<LibraryReservation[]> {
  const snap = await getDocs(query(reservationsRef, where('userId', '==', userId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryReservation)
}

/** Reservas todavía activas (en espera o ya listas para retirar), para la cola que ve el bibliotecario. */
export async function listPendingReservations(): Promise<LibraryReservation[]> {
  const snap = await getDocs(query(reservationsRef, where('status', 'in', ['en_espera', 'disponible_para_retirar'])))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LibraryReservation)
}

export async function cancelReservation(reservationId: string) {
  await updateDoc(doc(reservationsRef, reservationId), { status: 'cancelado' })
}

/**
 * El miembro no pasó a retirar el ejemplar reservado dentro de la ventana: lo libera y, si hay alguien más
 * esperando ese título, le pasa el turno; si no, el ejemplar vuelve a "disponible".
 */
export async function releaseExpiredReservation(reservation: LibraryReservation) {
  const [next, reservedCopiesSnap] = await Promise.all([
    nextWaitingReservation(reservation.titleId),
    getDocs(query(copiesRef, where('titleId', '==', reservation.titleId), where('status', '==', 'reservado'))),
  ])
  const reservedCopy = reservedCopiesSnap.docs[0]

  const batch = writeBatch(db)
  batch.update(doc(reservationsRef, reservation.id), { status: 'expirado' })
  if (next) {
    batch.update(doc(reservationsRef, next.id), {
      status: 'disponible_para_retirar',
      availableAt: Date.now(),
      expiresAt: Date.now() + RESERVATION_PICKUP_WINDOW_MS,
    })
  } else if (reservedCopy) {
    batch.update(doc(copiesRef, reservedCopy.id), { status: 'disponible' })
  }
  await batch.commit()
}

/** El miembro pasó a retirar el libro reservado: arma el préstamo con el ejemplar que había quedado apartado. */
export async function fulfillReservation(
  reservation: Pick<LibraryReservation, 'id' | 'titleId'>,
  loan: Omit<LibraryLoan, 'id' | 'copyId' | 'status' | 'returnDate' | 'renewalCount'>,
): Promise<string> {
  const reservedCopiesSnap = await getDocs(query(copiesRef, where('titleId', '==', reservation.titleId), where('status', '==', 'reservado')))
  const reservedCopy = reservedCopiesSnap.docs[0]
  if (!reservedCopy) throw new Error('No hay ningún ejemplar reservado para este título.')

  const batch = writeBatch(db)
  const loanDocRef = doc(loansRef)
  batch.set(loanDocRef, { ...loan, copyId: reservedCopy.id, status: 'activo', returnDate: null, renewalCount: 0 })
  batch.update(doc(copiesRef, reservedCopy.id), { status: 'prestado' })
  batch.update(doc(reservationsRef, reservation.id), { status: 'retirado' })
  await batch.commit()
  return loanDocRef.id
}
