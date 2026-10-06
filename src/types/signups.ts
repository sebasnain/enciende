export type Ministry = 'danza' | 'adoracion' | 'sin_especificar'

export const MINISTRY_LABELS: Record<Ministry, string> = {
  danza: 'Danzor',
  adoracion: 'Adorador',
  sin_especificar: 'Sin especificar',
}

export function ministryLabel(ministry: Ministry | undefined): string {
  return MINISTRY_LABELS[ministry ?? 'sin_especificar']
}

export interface SignupEvent {
  id: string
  title: string
  description: string
  /** Inicio del evento (opcional). */
  eventDate: number | null
  /** Fin del evento (opcional), para eventos de más de un día. */
  eventEndDate?: number | null
  location: string
  /** Banner chico que se muestra en el Inicio mientras dure la campaña. */
  bannerImageUrl: string
  /** Imagen grande que se muestra una vez por día al abrir el Inicio (opcional). */
  popupImageUrl: string
  showFrom: number | null
  showUntil: number | null
  /** Máximo de personas (el líder y sus acompañantes cuentan); null = sin límite. */
  capacity: number | null
  /** Si está activo, el formulario pregunta a cada persona si es danzor, adorador o sin especificar. */
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

const DAY_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }

function formatDay(ms: number): string {
  return new Date(ms).toLocaleDateString('es-AR', DAY_FORMAT)
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('es-AR', TIME_FORMAT)
}

/** "viernes 14 de noviembre, 19:00 hasta sábado 15 de noviembre, 18:00"; con inicio y fin el mismo día, "… de 19:00 a 22:00". */
export function formatEventDates(start: number | null | undefined, end: number | null | undefined): string {
  if (start && end) {
    if (new Date(start).toDateString() === new Date(end).toDateString()) {
      return `${formatDay(start)}, de ${formatTime(start)} a ${formatTime(end)}`
    }
    return `Desde el ${formatDay(start)}, ${formatTime(start)} hasta el ${formatDay(end)}, ${formatTime(end)}`
  }
  if (start) return `${formatDay(start)}, ${formatTime(start)}`
  if (end) return `Hasta el ${formatDay(end)}, ${formatTime(end)}`
  return ''
}

export function isSignupOpen(event: SignupEvent, now = Date.now()): boolean {
  return (!event.showFrom || event.showFrom <= now) && (!event.showUntil || event.showUntil >= now)
}

export function spotsLeft(event: SignupEvent): number | null {
  return event.capacity === null || event.capacity === undefined ? null : Math.max(0, event.capacity - event.registeredCount)
}
