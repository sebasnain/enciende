import { useState } from 'react'
import { BarcodeScanner } from '@/components/admin/BarcodeScanner'
import { lookupIsbn } from '@/services/isbnLookup.service'
import { Button } from '@/components/ui/Button'

interface IsbnScanButtonProps {
  onResult: (fields: Record<string, unknown>) => void
}

export function IsbnScanButton({ onResult }: IsbnScanButtonProps) {
  const [scanning, setScanning] = useState(false)
  const [looking, setLooking] = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleDetected(text: string) {
    setScanning(false)
    setNotFound(false)
    const isbn = text.replace(/[^0-9Xx]/g, '')
    if (!isbn) return

    setLooking(true)
    try {
      const data = await lookupIsbn(isbn)
      if (data) {
        onResult({
          isbn,
          ...(data.title && { title: data.title }),
          ...(data.author && { author: data.author }),
          ...(data.publisher && { publisher: data.publisher }),
          ...(data.coverImageUrl && { coverImageUrl: data.coverImageUrl }),
        })
      } else {
        onResult({ isbn })
        setNotFound(true)
      }
    } finally {
      setLooking(false)
    }
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <Button type="button" variant="secondary" onClick={() => setScanning(true)} disabled={looking}>
        {looking ? 'Buscando datos del libro…' : 'Escanear código de barras (ISBN)'}
      </Button>
      {notFound && (
        <p style={{ color: 'var(--color-ink-400)', fontSize: 13, margin: '4px 0 0' }}>
          No encontramos ese ISBN en Open Library. Se completó el ISBN igual; cargá el resto a mano.
        </p>
      )}
      {scanning && (
        <BarcodeScanner title="Escanear ISBN" onDetected={handleDetected} onClose={() => setScanning(false)} />
      )}
    </div>
  )
}
