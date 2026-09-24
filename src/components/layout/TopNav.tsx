import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { StreakFlame } from '@/components/streak/StreakFlame'
import logo from '@/assets/logo/logo-transparent.png'
import styles from './TopNav.module.css'

export function TopNav() {
  const { user, profile } = useAuth()

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <img src={logo} alt="Enciende" className={styles.logo} />
        <span>Enciende</span>
      </Link>
      <div className={styles.actions}>
        {profile && <StreakFlame streak={profile.streak.current} />}
        {user ? (
          <Link to="/perfil" className={styles.profileLink}>
            Perfil
          </Link>
        ) : (
          <Link to="/bienvenida" className={styles.profileLink}>
            Ingresar
          </Link>
        )}
      </div>
    </header>
  )
}
