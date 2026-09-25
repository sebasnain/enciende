/** Drops the installed app shell (service worker + its cached files) and reloads from the
 * server, so the newest deploy loads right away. Offline Bibles live in IndexedDB and the
 * Firebase session in its own storage, so neither is affected. */
export async function forceAppUpdate() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((r) => r.unregister()))
  }
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  }
  window.location.reload()
}

export function buildLabel(): string {
  return new Date(__BUILD_TIME__).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}
