import { useEffect, useState } from 'react'
import { getLiveSettings, getSocialSettings, setLiveSettings, setSocialSettings } from '@/services/live.service'
import type { LiveSettings, SocialSettings } from '@/types/products'
import { Button } from '@/components/ui/Button'
import styles from '@/components/admin/AdminCrudPage.module.css'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function LiveSettingsEditor() {
  const [live, setLive] = useState<LiveSettings | null>(null)
  const [social, setSocial] = useState<Partial<SocialSettings>>({})

  useEffect(() => {
    getLiveSettings().then(setLive)
    getSocialSettings().then((s) => setSocial(s ?? {}))
  }, [])

  if (!live) return null

  return (
    <div className={styles.layout}>
      <h2>Transmisión en vivo</h2>
      <div className={styles.form}>
        <label>
          <span>Día programado</span>
          <select
            className={styles.input}
            value={live.scheduleDay}
            onChange={(e) => setLive({ ...live, scheduleDay: Number(e.target.value) })}
          >
            {DAYS.map((day, i) => (
              <option key={day} value={i}>
                {day}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Hora (0-23)</span>
          <input
            className={styles.input}
            type="number"
            value={live.scheduleHour}
            onChange={(e) => setLive({ ...live, scheduleHour: Number(e.target.value) })}
          />
        </label>
        <label>
          <span>Duración (minutos)</span>
          <input
            className={styles.input}
            type="number"
            value={live.durationMinutes}
            onChange={(e) => setLive({ ...live, durationMinutes: Number(e.target.value) })}
          />
        </label>
        <label>
          <span>Link del canal de YouTube</span>
          <input
            className={styles.input}
            value={live.channelUrl}
            onChange={(e) => setLive({ ...live, channelUrl: e.target.value })}
            placeholder="https://youtube.com/@tucanal"
          />
        </label>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={live.manualActive}
            onChange={(e) => setLive({ ...live, manualActive: e.target.checked })}
          />
          Forzar "en vivo" ahora (evento especial)
        </label>
        <label>
          <span>ID de video manual (opcional)</span>
          <input
            className={styles.input}
            value={live.manualVideoId ?? ''}
            onChange={(e) => setLive({ ...live, manualVideoId: e.target.value })}
          />
        </label>
        <Button onClick={() => setLiveSettings(live)}>Guardar en vivo</Button>
      </div>

      <h2>Redes y contacto</h2>
      <div className={styles.form}>
        {(['instagram', 'whatsapp', 'youtube', 'website', 'address', 'mapUrl'] as const).map((key) => (
          <label key={key}>
            <span>{key}</span>
            <input
              className={styles.input}
              value={social[key] ?? ''}
              onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value }))}
            />
          </label>
        ))}
        <Button onClick={() => setSocialSettings(social)}>Guardar redes</Button>
      </div>
    </div>
  )
}
