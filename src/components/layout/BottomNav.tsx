import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const ITEMS = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/biblia', label: 'Biblia', icon: '📖' },
  { to: '/planes', label: 'Planes', icon: '🌱' },
  { to: '/cronograma', label: 'Agenda', icon: '📅' },
  { to: '/libreria', label: 'Librería', icon: '📚' },
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
          <span className={styles.icon}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
