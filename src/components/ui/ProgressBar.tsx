import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  max: number
  variant?: 'dark' | 'light'
  className?: string
}

export function ProgressBar({ value, max, variant = 'dark', className }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      className={`${styles.track} ${variant === 'light' ? styles.light : ''} ${className ?? ''}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  )
}
