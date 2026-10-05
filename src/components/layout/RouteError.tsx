import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { forceAppUpdate } from '@/utils/appUpdate'

const AUTO_RELOAD_KEY = 'enciende.autoReloadedAt'

/** Tras un deploy, una pestaña con la versión vieja pide archivos que ya no existen: el arreglo es recargar la app. */
function isStaleBuildError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /dynamically imported module|Importing a module script failed|Failed to fetch|Loading chunk|MIME type/i.test(message)
}

function canAutoReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(AUTO_RELOAD_KEY) ?? 0)
    if (Date.now() - last < 60_000) return false
    sessionStorage.setItem(AUTO_RELOAD_KEY, String(Date.now()))
    return true
  } catch {
    return false
  }
}

export function RouteError() {
  const error = useRouteError()
  const stale = isStaleBuildError(error)

  useEffect(() => {
    console.error('Error de la app', error)
    if (stale && canAutoReload()) forceAppUpdate()
  }, [error, stale])

  const detail = error instanceof Error ? error.message : typeof error === 'string' ? error : ''

  return (
    <div style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <h1>{stale ? 'Hay una versión nueva' : 'Algo salió mal'}</h1>
      <p style={{ color: 'var(--color-ink-400)' }}>
        {stale ? 'Estamos actualizando la app…' : 'Probá recargar. Si sigue pasando, avisanos y pasanos el texto de abajo.'}
      </p>
      {!stale && detail && (
        <code style={{ fontSize: 12, background: 'var(--color-cream-400)', padding: 8, borderRadius: 8, wordBreak: 'break-word' }}>
          {detail}
        </code>
      )}
      <Button onClick={() => forceAppUpdate()}>Actualizar y recargar</Button>
    </div>
  )
}
