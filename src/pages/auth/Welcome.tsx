import { Link } from 'react-router-dom'
import logo from '@/assets/logo/logo-transparent.png'
import backgroundImage from '@/assets/welcome-bg.jpg'
import styles from './Welcome.module.css'

export function Welcome() {
  return (
    <div className={styles.page} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} />
          <h1 className={styles.title}>ENCIENDE</h1>
          <p className={styles.subtitle}>Enciende tu fe</p>
        </div>

        <div className={styles.actions}>
          <Link to="/login" className={`${styles.button} ${styles.login}`}>
            Iniciar sesión
          </Link>
          <Link to="/register" className={`${styles.button} ${styles.register}`}>
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  )
}
