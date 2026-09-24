import fuego1 from '@/assets/streak/fuego-1.png'
import fuego2 from '@/assets/streak/fuego-2.png'
import fuego3 from '@/assets/streak/fuego-3.png'
import fuego4 from '@/assets/streak/fuego-4.png'
import fuego5 from '@/assets/streak/fuego-5.png'
import styles from './StreakFlame.module.css'

const TIERS = [
  { min: 0, src: fuego5 },
  { min: 1, src: fuego4 },
  { min: 3, src: fuego3 },
  { min: 7, src: fuego2 },
  { min: 14, src: fuego1 },
]

function tierFor(streak: number) {
  return [...TIERS].reverse().find((tier) => streak >= tier.min) ?? TIERS[0]
}

export function StreakFlame({ streak, size = 32 }: { streak: number; size?: number }) {
  const tier = tierFor(streak)

  return (
    <div className={styles.wrap} title={`Racha: ${streak} día${streak === 1 ? '' : 's'}`}>
      <img src={tier.src} alt="" width={size} height={size} className={styles.flame} />
      <span className={styles.count}>{streak}</span>
    </div>
  )
}
