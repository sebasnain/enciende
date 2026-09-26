import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { copyQrPayload } from '@/utils/libraryQr'

interface CopyQrModalProps {
  copyId: string
  titleName: string
  onClose: () => void
}

export function CopyQrModal({ copyId, titleName, onClose }: CopyQrModalProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(copyQrPayload(copyId), { width: 320, margin: 2 }).then(setDataUrl)
  }, [copyId])

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `ejemplar-${copyId}.png`
    a.click()
  }

  function handlePrint() {
    if (!dataUrl) return
    const win = window.open('', '_blank', 'width=400,height=500')
    if (!win) return
    win.document.write(`
      <html>
        <head><title>Etiqueta - ${titleName}</title></head>
        <body style="text-align:center; font-family: sans-serif; padding: 24px;">
          <img src="${dataUrl}" style="width:280px;height:280px;" />
          <p style="font-size:14px;">${titleName}<br/>Ejemplar #${copyId.slice(-6)}</p>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <Modal title={`QR del ejemplar #${copyId.slice(-6)}`} onClose={onClose}>
      {dataUrl ? (
        <div style={{ textAlign: 'center' }}>
          <img src={dataUrl} alt="Código QR del ejemplar" style={{ width: 240, height: 240 }} />
          <p style={{ fontSize: 13, color: 'var(--color-ink-400)' }}>{titleName}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button type="button" onClick={handlePrint}>
              Imprimir etiqueta
            </Button>
            <Button type="button" variant="secondary" onClick={handleDownload}>
              Descargar
            </Button>
          </div>
        </div>
      ) : (
        <p>Generando QR…</p>
      )}
    </Modal>
  )
}
