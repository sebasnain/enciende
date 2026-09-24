import { useEffect, useState } from 'react'
import { getDefinition } from '@/services/bolls/dictionary'
import type { DictionaryEntry } from '@/types/bible'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function DictionaryPopover({ word, onClose }: { word: string; onClose: () => void }) {
  const [entries, setEntries] = useState<DictionaryEntry[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDefinition(word)
      .then((result) => !cancelled && setEntries(result))
      .catch(() => !cancelled && setEntries([]))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [word])

  return (
    <Modal title={word} onClose={onClose}>
      {loading && <Spinner />}
      {!loading && (!entries || entries.length === 0) && (
        <EmptyState message="No se encontró una definición para esta palabra." />
      )}
      {!loading &&
        entries?.map((entry, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            {entry.lexeme && <p style={{ fontWeight: 700 }}>{entry.lexeme}</p>}
            {entry.transliteration && <p style={{ fontStyle: 'italic', color: 'var(--color-ink-400)' }}>{entry.transliteration}</p>}
            <p>{entry.definition}</p>
          </div>
        ))}
    </Modal>
  )
}
