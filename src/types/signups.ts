export type Ministry = 'danza' | 'adoracion' | 'sin_especificar'

export const MINISTRY_LABELS: Record<Ministry, string> = {
  danza: 'Danzarín/a',
  adoracion: 'Adorador/a',
  sin_especificar: 'Sin especificar',
}

export interface SignupEvent {
  id: string
  title: string
  description: string
  eventDate: number | null
  location: string
  /** Banner chico que se muestra en el Inicio mientras dure la campaña. */
  bannerImageUrl: string
  /** Imagen grande que se muestra una vez por día al abrir el Inicio (opcional). */
  popupImageUrl: string
  showFrom: number | null
  showUntil: number | null
  /** Máximo de personas (el líder y sus acompañantes cuentan); null = sin límite. */
  capacity: number | null
  /** Si está activo, el formulario pregunta a cada persona si es danzarín/a, adorador/a o sin especificar. */
  askMinistry?: boolean
  /** Personas ya inscriptas. Lo mantiene la propia inscripción, nunca se edita desde el formulario del evento. */
  registeredCount: number
  createdAt: number
}

export interface Attendee {
  firstName: string
  lastName: string
  age: number
  ministry?: Ministry
}

/** El id del documento es el uid de quien se inscribe: una inscripción por cuenta y por evento. */
export interface SignupRegistration {
  id: string
  userId: string
  firstName: string
  lastName: string
  age: number
  ministry?: Ministry
  church: string
  city: string
  phone: string
  isGroupLeader: boolean
  companions: Attendee[]
  totalPeople: number
  createdAt: number
}

export type RegistrationInput = Omit<SignupRegistration, 'id' | 'userId' | 'totalPeople' | 'createdAt'>

export function isSignupOpen(event: SignupEvent, now = Date.now()): boolean {
  return (!event.showFrom || event.showFrom <= now) && (!event.showUntil || event.showUntil >= now)
}

export function spotsLeft(event: SignupEvent): number | null {
  return event.capacity === null || event.capacity === undefined ? null : Math.max(0, event.capacity - event.registeredCount)
}
