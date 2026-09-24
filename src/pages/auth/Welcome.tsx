import { Link } from 'react-router-dom'
import logo from '@/assets/logo/logo-light.png'
import heroImage from '@/assets/welcome-bg.jpg'
import styles from './Welcome.module.css'

export function Welcome() {
  return (
    <div className={styles.page}>
      <div className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }}>
        <div className={styles.heroTint} />
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} />
          <h1 className={styles.title}>ENCIENDE</h1>
          <p className={styles.subtitle}>Enciende tu fe</p>
        </div>
        <svg className={styles.wave} viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
          <path
            fill="#c1111f"
            fillOpacity="1"
            d="M0,128L48,128C96,128,192,128,288,112C384,96,480,64,576,42.7C672,21,768,11,864,42.7C960,75,1056,149,1152,170.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      <div className={styles.bottom}>
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
