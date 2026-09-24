import { useEffect, useState } from 'react'
import { getLiveSettings, isLiveNow } from '@/services/live.service'
import type { LiveSettings } from '@/types/products'

export function useLive() {
  const [settings, setSettings] = useState<LiveSettings | null>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    getLiveSettings().then((liveSettings) => {
      setSettings(liveSettings)
      setLive(isLiveNow(liveSettings))
      interval = setInterval(() => setLive(isLiveNow(liveSettings)), 60_000)
    })

    return () => clearInterval(interval)
  }, [])

  return { settings, live }
}
