import { Link } from 'react-router-dom'
import styles from './ListCard.module.css'

interface ListCardProps {
  to: string
  title: string
  subtitle?: string
  coverImage?: string | null
}

export function ListCard({ to, title, subtitle, coverImage }: ListCardProps) {
  return (
    <Link to={to} className={styles.card}>
      {coverImage && <img src={coverImage} alt="" className={styles.cover} />}
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </Link>
  )
}
