import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { Modal } from '@/components/ui/Modal'

interface BarcodeScannerProps {
  title: string
  onDetected: (text: string) => void
  onClose: () => void
}

/** Escanea tanto códigos de barras (ISBN) como QR propios: ZXing detecta el formato automáticamente. */
export function BarcodeScanner({ title, onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let stopped = false
    let controls: IScannerControls | undefined

    reader
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, videoRef.current!, (result) => {
        if (stopped || !result) return
        stopped = true
        controls?.stop()
        onDetectedRef.current(result.getText())
      })
      .then((c) => {
        if (stopped) {
          c.stop()
        } else {
          controls = c
        }
      })
      .catch(() => setError('No se pudo acceder a la cámara. Revisá los permisos del navegador.'))

    return () => {
      stopped = true
      controls?.stop()
    }
  }, [])

  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ color: 'var(--color-ink-400)', fontSize: 13, marginTop: 0 }}>Apuntá la cámara al código de barras o al QR.</p>
      {error ? (
        <p style={{ color: 'var(--color-danger, #c0392b)' }}>{error}</p>
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video ref={videoRef} muted style={{ width: '100%', borderRadius: 8, background: '#000' }} />
      )}
    </Modal>
  )
}
