import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const LINKS = [
  { to: '/biblia', icon: '📖', title: 'Lectura Bíblica', desc: 'NVI y RVR60' },
  { to: '/planes', icon: '🌱', title: 'Planes de Lectura', desc: 'Crece día a día' },
  { to: '/devocionales', icon: '☀️', title: 'Devocionales', desc: 'Reflexiones diarias' },
  { to: '/estudios', icon: '🧭', title: 'Estudios', desc: 'Profundiza en la Palabra' },
  { to: '/cronograma', icon: '📅', title: 'Cronograma', desc: 'Actividades y cultos' },
  { to: '/libreria', icon: '📚', title: 'Librería', desc: 'Recursos de la iglesia' },
]

export function Home() {
  return (
    <div>
      <div className={styles.hero}>
        <h1 className={styles.title}>Enciende tu fe cada día</h1>
        <p className={styles.subtitle}>Tu espacio digital para conectar con la familia de la fe.</p>
      </div>
      <div className={styles.grid}>
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className={styles.card}>
            <span className={styles.cardIcon}>{link.icon}</span>
            <span className={styles.cardTitle}>{link.title}</span>
            <span>{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
