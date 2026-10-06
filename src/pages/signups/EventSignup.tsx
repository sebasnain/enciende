import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getMyRegistration, getSignupEvent, registerForEvent } from '@/services/signups.service'
import { formatEventDates, isSignupOpen, MINISTRY_LABELS, spotsLeft, type Ministry, type SignupEvent, type SignupRegistration } from '@/types/signups'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import styles from './EventSignup.module.css'

interface PersonForm {
  firstName: string
  lastName: string
  age: string
  ministry: Ministry
}

const EMPTY_PERSON: PersonForm = { firstName: '', lastName: '', age: '', ministry: 'sin_especificar' }
const MAX_COMPANIONS = 30

function parseAge(raw: string): number | null {
  const age = Number(raw)
  return raw.trim() !== '' && Number.isInteger(age) && age >= 0 && age <= 120 ? age : null
}

function isPersonComplete(person: PersonForm): boolean {
  return !!person.firstName.trim() && !!person.lastName.trim() && parseAge(person.age) !== null
}

function MinistrySelect({ value, onChange }: { value: Ministry; onChange: (value: Ministry) => void }) {
  return (
    <select className={styles.input} value={value} onChange={(e) => onChange(e.target.value as Ministry)}>
      {(Object.keys(MINISTRY_LABELS) as Ministry[]).map((key) => (
        <option key={key} value={key}>
          {MINISTRY_LABELS[key]}
        </option>
      ))}
    </select>
  )
}

export function EventSignup() {
  const { eventId = '' } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState<SignupEvent | null>(null)
  const [existing, setExisting] = useState<SignupRegistration | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [me, setMe] = useState<PersonForm>(EMPTY_PERSON)
  const [church, setChurch] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [isGroupLeader, setIsGroupLeader] = useState(false)
  const [companions, setCompanions] = useState<PersonForm[]>([{ ...EMPTY_PERSON }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([getSignupEvent(eventId), getMyRegistration(eventId, user.uid)])
      .then(([e, registration]) => {
        setEvent(e)
        setExisting(registration)
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [eventId, user])

  function updateCompanion(index: number, patch: Partial<PersonForm>) {
    setCompanions((list) => list.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !event) return
    setError(null)

    const myAge = parseAge(me.age)
    if (!isPersonComplete(me) || myAge === null) return setError('Completá tu nombre, apellido y una edad válida.')
    if (!church.trim() || !city.trim() || !phone.trim()) return setError('Completá iglesia, ciudad y teléfono.')
    if (isGroupLeader && companions.length === 0) {
      return setError('Agregá al menos una persona a tu grupo, o desmarcá "Soy líder de grupo".')
    }
    if (isGroupLeader && !companions.every(isPersonComplete)) {
      return setError('Completá nombre, apellido y edad de cada persona del grupo (o quitá las filas vacías).')
    }

    setSaving(true)
    try {
      await registerForEvent(event.id, user.uid, {
        firstName: me.firstName.trim(),
        lastName: me.lastName.trim(),
        age: myAge,
        ...(event.askMinistry ? { ministry: me.ministry } : {}),
        church: church.trim(),
        city: city.trim(),
        phone: phone.trim(),
        isGroupLeader,
        companions: isGroupLeader
          ? companions.map((c) => ({
              firstName: c.firstName.trim(),
              lastName: c.lastName.trim(),
              age: parseAge(c.age)!,
              ...(event.askMinistry ? { ministry: c.ministry } : {}),
            }))
          : [],
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la inscripción. Probá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />
  if (loadError) return <p>No se pudo cargar el evento. Probá de nuevo en un momento.</p>
  if (!event) return <p>No encontramos ese evento.</p>

  if (done || existing) {
    const people = existing?.totalPeople
    return (
      <div className={styles.page}>
        <h1>{event.title}</h1>
        <p className={styles.success}>
          {done ? '¡Listo, quedaste inscripto!' : 'Ya estás inscripto en este evento.'}
          {people && people > 1 ? ` (${people} personas)` : ''}
        </p>
        <Link to="/">Volver al inicio</Link>
      </div>
    )
  }

  const left = spotsLeft(event)
  if (!isSignupOpen(event)) {
    return (
      <div className={styles.page}>
        <h1>{event.title}</h1>
        <p>La inscripción a este evento no está abierta.</p>
      </div>
    )
  }
  if (left === 0) {
    return (
      <div className={styles.page}>
        <h1>{event.title}</h1>
        <p>Los cupos están agotados.</p>
      </div>
    )
  }

  const meAge = parseAge(me.age)

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <h1>{event.title}</h1>
      {event.description && <p className={styles.description}>{event.description}</p>}
      {(event.eventDate || event.eventEndDate || event.location) && (
        <p className={styles.meta}>
          {formatEventDates(event.eventDate, event.eventEndDate)}
          {(event.eventDate || event.eventEndDate) && event.location ? ' · ' : ''}
          {event.location}
        </p>
      )}
      {left !== null && <p className={styles.meta}>Quedan {left} cupos.</p>}

      <h2>Tus datos</h2>
      <input className={styles.input} placeholder="Nombre" value={me.firstName} onChange={(e) => setMe({ ...me, firstName: e.target.value })} />
      <input className={styles.input} placeholder="Apellido" value={me.lastName} onChange={(e) => setMe({ ...me, lastName: e.target.value })} />
      <input
        className={styles.input}
        type="number"
        inputMode="numeric"
        min={0}
        max={120}
        placeholder="Edad"
        value={me.age}
        onChange={(e) => setMe({ ...me, age: e.target.value })}
      />
      {event.askMinistry && <MinistrySelect value={me.ministry} onChange={(ministry) => setMe({ ...me, ministry })} />}
      <input className={styles.input} placeholder="Iglesia" value={church} onChange={(e) => setChurch(e.target.value)} />
      <input className={styles.input} placeholder="Ciudad desde donde viajás" value={city} onChange={(e) => setCity(e.target.value)} />
      <input className={styles.input} type="tel" placeholder="Teléfono / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />

      {meAge !== null && meAge < 18 && !isGroupLeader && (
        <p className={styles.hint}>Si sos menor de edad, pedile a tu líder o responsable que te anote junto con el grupo.</p>
      )}

      <label className={styles.checkRow}>
        <input type="checkbox" checked={isGroupLeader} onChange={(e) => setIsGroupLeader(e.target.checked)} />
        Soy líder de grupo y inscribo a las personas que van conmigo
      </label>

      {isGroupLeader && (
        <div className={styles.group}>
          <h2>Personas de tu grupo</h2>
          <p className={styles.hint}>Como líder, sos el responsable de las personas que anotes (en especial los menores).</p>
          {companions.map((companion, index) => (
            <div key={index} className={styles.companion}>
              <input
                className={styles.input}
                placeholder="Nombre"
                value={companion.firstName}
                onChange={(e) => updateCompanion(index, { firstName: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="Apellido"
                value={companion.lastName}
                onChange={(e) => updateCompanion(index, { lastName: e.target.value })}
              />
              <input
                className={styles.input}
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                placeholder="Edad"
                value={companion.age}
                onChange={(e) => updateCompanion(index, { age: e.target.value })}
              />
              {event.askMinistry && (
                <MinistrySelect value={companion.ministry} onChange={(ministry) => updateCompanion(index, { ministry })} />
              )}
              <button type="button" className={styles.remove} onClick={() => setCompanions((list) => list.filter((_, i) => i !== index))}>
                Quitar
              </button>
            </div>
          ))}
          {companions.length < MAX_COMPANIONS && (
            <Button type="button" variant="secondary" onClick={() => setCompanions((list) => [...list, { ...EMPTY_PERSON }])}>
              Agregar otra persona
            </Button>
          )}
          <p className={styles.hint}>Total a inscribir: {1 + companions.length} personas.</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Inscribiendo…' : 'Inscribirme'}
      </Button>
    </form>
  )
}
