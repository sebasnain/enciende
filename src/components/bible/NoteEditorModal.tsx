import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface NoteEditorModalProps {
  verse: number
  initialNote: string
  onSave: (note: string) => void
  onClose: () => void
}

export function NoteEditorModal({ verse, initialNote, onSave, onClose }: NoteEditorModalProps) {
  const [note, setNote] = useState(initialNote)

  return (
    <Modal title={`Nota — versículo ${verse}`} onClose={onClose}>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={5}
        style={{
          width: '100%',
          borderRadius: 12,
          border: '1px solid var(--color-cream-500)',
          padding: 12,
          fontFamily: 'inherit',
          fontSize: 15,
          resize: 'vertical',
        }}
        placeholder="Escribe tu reflexión sobre este versículo..."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            onSave(note)
            onClose()
          }}
        >
          Guardar
        </Button>
      </div>
    </Modal>
  )
}
