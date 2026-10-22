import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getMembershipPlan } from '@/services/library.service'
import { isMembershipActive } from '@/types/library'
import styles from './CommunityLibrary.module.css'

const DEFAULT_MONTHLY_PRICE = 2500

/** Botón para que alguien sin membresía activa la solicite por WhatsApp. No se muestra si ya es miembro o falta el número. */
export function MembershipRequestButton() {
  const { user, profile } = useAuth()
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [price, setPrice] = useState(DEFAULT_MONTHLY_PRICE)

  useEffect(() => {
    getMembershipPlan()
      .then((plan) => {
        if (!plan) return
        setWhatsappNumber(plan.whatsappNumber ?? '')
        if (plan.price > 0) setPrice(plan.price)
      })
      .catch(() => {})
  }, [])

  if (!user || !profile || !whatsappNumber || isMembershipActive(profile.libraryMembership)) return null

  const message = `Hola! Soy ${profile.displayName} y quiero solicitar ser miembro de la biblioteca de Enciende ($${price.toLocaleString('es-AR')} al mes).`
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.reserveButton}
      style={{ display: 'block', textAlign: 'center', textDecoration: 'none', margin: '12px 0' }}
    >
      Solicitar ser miembro de la biblioteca · ${price.toLocaleString('es-AR')} al mes
    </a>
  )
}
