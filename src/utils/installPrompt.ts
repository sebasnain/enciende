interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

// Chrome en Android dispara este evento una sola vez, apenas carga la página: hay que escucharlo desde el arranque
// de la app (este módulo se importa en main.tsx) y guardarlo para usarlo cuando la persona toque "Instalar".
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
  })
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}

export function canInstall(): boolean {
  return deferred !== null && !isStandalone()
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Abre el cuadro de instalación del navegador. Devuelve true si la persona aceptó. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const event = deferred
  await event.prompt()
  const { outcome } = await event.userChoice
  deferred = null
  notify()
  return outcome === 'accepted'
}
