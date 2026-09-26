const QR_PREFIX = 'enciende-biblioteca:'

/** Contenido que se codifica en el QR impreso de un ejemplar. */
export function copyQrPayload(copyId: string): string {
  return `${QR_PREFIX}${copyId}`
}

/** Extrae el id de ejemplar de un texto escaneado, o null si no es un QR de Enciende. */
export function parseCopyQrPayload(text: string): string | null {
  return text.startsWith(QR_PREFIX) ? text.slice(QR_PREFIX.length) : null
}
