import { useLive } from '@/hooks/useLive'
import styles from './LiveBanner.module.css'

export function LiveBanner() {
  const { settings, live } = useLive()
  if (!live || !settings) return null

  const href = settings.manualActive && settings.manualVideoId
    ? `https://www.youtube.com/watch?v=${settings.manualVideoId}`
    : `${settings.channelUrl}/live`

  return (
    <a className={styles.banner} href={href} target="_blank" rel="noreferrer">
      <span className={styles.dot} />
      Estamos en vivo ahora — toca para ver la transmisión
    </a>
  )
}
