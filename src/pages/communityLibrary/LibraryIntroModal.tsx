import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@/components/ui/Modal'
import { isMembershipActive } from '@/types/library'
import { MembershipRequestButton } from './MembershipRequestButton'

const INTRO_KEY = 'enciende.libraryIntro'

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA')
}

function shouldShowToday(): boolean {
  try {
    if (localStorage.getItem(INTRO_KEY) === todayKey()) return false
    localStorage.setItem(INTRO_KEY, todayKey())
  } catch {
    // sin localStorage el aviso puede repetirse; no es grave
  }
  return true
}

/** Aviso de bienvenida a la biblioteca: una vez por día, y no a quienes ya son miembros. */
export function LibraryIntroModal() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(shouldShowToday)

  if (!open || isMembershipActive(profile?.libraryMembership)) return null

  return (
    <Modal title="Biblioteca comunitaria" onClose={() => setOpen(false)}>
      <p>
        Esta es una biblioteca comunitaria con libros usados pero interesantes que te ayudarán a tu crecimiento espiritual.
      </p>
      <p>
        Para acceder al préstamo de los mismos, tenés que sumarte abonando una mensualidad mínima de <strong>$2.500</strong>.
      </p>
      <MembershipRequestButton />
    </Modal>
  )
}
