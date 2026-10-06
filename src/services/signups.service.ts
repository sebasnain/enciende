import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import {
  isSignupOpen,
  type RegistrationInput,
  type SignupEvent,
  type SignupRegistration,
} from '@/types/signups'

const eventsRef = collection(db, 'signupEvents')

function registrationsRef(eventId: string) {
  return collection(db, 'signupEvents', eventId, 'registrations')
}

export async function listSignupEvents(): Promise<SignupEvent[]> {
  const snap = await getDocs(query(eventsRef, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SignupEvent)
}

export async function listActiveSignupEvents(): Promise<SignupEvent[]> {
  const all = await listSignupEvents()
  return all.filter((event) => isSignupOpen(event))
}

export async function getSignupEvent(eventId: string): Promise<SignupEvent | null> {
  const snap = await getDoc(doc(eventsRef, eventId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as SignupEvent) : null
}

export async function createSignupEvent(event: Omit<SignupEvent, 'id' | 'registeredCount' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(eventsRef, { ...event, registeredCount: 0, createdAt: Date.now() })
  return docRef.id
}

/** El contador de inscriptos nunca se pisa desde el formulario del evento: puede haber cambiado mientras se editaba. */
export async function updateSignupEvent(eventId: string, patch: Partial<SignupEvent>) {
  const { id: _id, registeredCount: _count, createdAt: _createdAt, ...editable } = patch
  await updateDoc(doc(eventsRef, eventId), editable)
}

/** Firestore no borra subcolecciones solo: se eliminan las inscripciones (en tandas) antes que el evento. */
export async function deleteSignupEvent(eventId: string) {
  const registrations = await getDocs(registrationsRef(eventId))
  for (let i = 0; i < registrations.docs.length; i += 400) {
    const batch = writeBatch(db)
    registrations.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  await deleteDoc(doc(eventsRef, eventId))
}

export async function getMyRegistration(eventId: string, uid: string): Promise<SignupRegistration | null> {
  const snap = await getDoc(doc(registrationsRef(eventId), uid))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as SignupRegistration) : null
}

/** Inscribe y descuenta cupo en una sola transacción, para que dos personas no se queden con el último lugar. */
export async function registerForEvent(eventId: string, uid: string, input: RegistrationInput): Promise<void> {
  const eventRef = doc(eventsRef, eventId)
  const registrationRef = doc(registrationsRef(eventId), uid)
  const companions = input.isGroupLeader ? input.companions : []
  const totalPeople = 1 + companions.length

  await runTransaction(db, async (tx) => {
    const [eventSnap, registrationSnap] = await Promise.all([tx.get(eventRef), tx.get(registrationRef)])
    if (!eventSnap.exists()) throw new Error('Este evento ya no existe.')
    if (registrationSnap.exists()) throw new Error('Ya estás inscripto en este evento.')

    const event = { id: eventSnap.id, ...eventSnap.data() } as SignupEvent
    if (!isSignupOpen(event)) throw new Error('La inscripción a este evento está cerrada.')
    if (event.capacity !== null && event.capacity !== undefined && event.registeredCount + totalPeople > event.capacity) {
      const left = Math.max(0, event.capacity - event.registeredCount)
      throw new Error(left === 0 ? 'Los cupos están agotados.' : `Solo quedan ${left} cupos y estás inscribiendo a ${totalPeople} personas.`)
    }

    tx.set(registrationRef, { ...input, companions, userId: uid, totalPeople, createdAt: Date.now() })
    tx.update(eventRef, { registeredCount: event.registeredCount + totalPeople })
  })
}

export async function listRegistrations(eventId: string): Promise<SignupRegistration[]> {
  const snap = await getDocs(query(registrationsRef(eventId), orderBy('createdAt', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SignupRegistration)
}

/** Solo admin: borra la inscripción y devuelve los cupos al evento. */
export async function removeRegistration(eventId: string, registration: SignupRegistration, currentCount: number) {
  const batch = writeBatch(db)
  batch.delete(doc(registrationsRef(eventId), registration.id))
  batch.update(doc(eventsRef, eventId), { registeredCount: Math.max(0, currentCount - registration.totalPeople) })
  await batch.commit()
}
