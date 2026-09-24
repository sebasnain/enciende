import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import styles from './BottomNav.module.css'

const ITEMS = [
  { to: '/', label: 'Inicio', icon: 'house-door-fill' },
  { to: '/biblia', label: 'Biblia', icon: 'book-fill' },
  { to: '/planes', label: 'Planes', icon: 'cup-hot-fill' },
  { to: '/cronograma', label: 'Agenda', icon: 'calendar-event-fill' },
  { to: '/libreria', label: 'Librería', icon: 'shop' },
]

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <Icon name={item.icon} className={styles.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
