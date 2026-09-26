import { useState } from 'react'
import qrImage from '@/assets/share/qr-bienvenida.svg'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import styles from './ShareApp.module.css'

// Always the production sign-up screen (the QR image encodes this same URL).
const SHARE_URL = 'https://enciendewebapp.web.app/bienvenida'
const SHARE_TEXT = 'Sumate a Enciende: la Biblia, planes de lectura, devocionales y más.'

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Some in-app browsers block the async clipboard API; the legacy path often still works.
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

export function ShareApp() {
  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  async function copyLink() {
    if (await writeClipboard(SHARE_URL)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setCopyFailed(true)
    }
  }

  async function handleShare() {
    if (!navigator.share) return copyLink()
    try {
      await navigator.share({ title: 'Enciende', text: SHARE_TEXT, url: SHARE_URL })
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') await copyLink()
    }
  }

  return (
    <section className={styles.box}>
      <h2 className={styles.title}>Compartir Enciende</h2>
      <p className={styles.text}>Invitá a alguien a sumarse: mostrale el QR o mandale el link.</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => setQrOpen(true)}>
          <Icon name="qr-code" /> Mostrar QR
        </Button>
        <Button onClick={handleShare}>
          <Icon name={copied ? 'check-lg' : 'share-fill'} /> {copied ? '¡Link copiado!' : 'Enviar link'}
        </Button>
      </div>
      {copyFailed && !qrOpen && <ManualLink />}

      {qrOpen && (
        <Modal title="Escaneá para entrar" onClose={() => setQrOpen(false)}>
          <div className={styles.qrWrap}>
            <img src={qrImage} alt="Código QR para entrar a Enciende" className={styles.qr} />
            <p className={styles.text}>Apuntá la cámara del celular al código.</p>
            <button type="button" className={styles.copyLink} onClick={copyLink}>
              <Icon name={copied ? 'check-lg' : 'link-45deg'} /> {copied ? '¡Link copiado!' : 'Copiar link'}
            </button>
            {copyFailed && <ManualLink />}
          </div>
        </Modal>
      )}
    </section>
  )
}

function ManualLink() {
  return (
    <p className={styles.manual}>
      No pudimos copiarlo automáticamente. Mantené presionado el link para copiarlo:
      <span className={styles.manualUrl}>{SHARE_URL}</span>
    </p>
  )
}
