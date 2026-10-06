import { useSyncExternalStore } from 'react'
import { canInstall, promptInstall, subscribeInstall } from '@/utils/installPrompt'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import styles from './ShareApp.module.css'

/** Botón para agregar Enciende a la pantalla de inicio. No se muestra si el navegador no lo permite o ya está instalada. */
export function InstallApp() {
  const installable = useSyncExternalStore(subscribeInstall, canInstall, () => false)
  if (!installable) return null

  return (
    <section className={styles.box}>
      <h2 className={styles.title}>Instalá Enciende</h2>
      <p className={styles.text}>Agregá el ícono a tu pantalla de inicio y abrila como una app, sin buscarla en el navegador.</p>
      <div className={styles.actions}>
        <Button onClick={() => promptInstall()}>
          <Icon name="download" /> Instalar app
        </Button>
      </div>
    </section>
  )
}
