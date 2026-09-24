import styles from './StreakFlame.module.css'

const TIERS = [
  { min: 0, scale: 0.55, opacity: 0.5 },
  { min: 1, scale: 0.7, opacity: 0.7 },
  { min: 3, scale: 0.85, opacity: 0.85 },
  { min: 7, scale: 1, opacity: 1 },
  { min: 14, scale: 1.2, opacity: 1 },
]

function tierFor(streak: number) {
  return [...TIERS].reverse().find((tier) => streak >= tier.min) ?? TIERS[0]
}

export function StreakFlame({ streak, size = 32 }: { streak: number; size?: number }) {
  const tier = tierFor(streak)

  return (
    <div className={styles.wrap} title={`Racha: ${streak} día${streak === 1 ? '' : 's'}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        style={{ transform: `scale(${tier.scale})`, opacity: tier.opacity }}
      >
        <path
          d="M16 3c2.4 4.6-1.1 5.8-1.1 9 0 2.2 2.1 3.4 2.1 3.4s3.4-1.2 3.4-5.7c3.4 3.4 4.5 8 1.1 11.4-2.3 2.3-5.7 3.4-9.1 1.1-3.4-2.3-4.5-6.8-1.1-11.4 1.1-1.1 2.3-2.3 4.7-7.8z"
          fill="var(--color-flame-500)"
        />
      </svg>
      <span className={styles.count}>{streak}</span>
    </div>
  )
}
