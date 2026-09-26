import { useEffect, useState } from 'react'
import { listAllUsers } from '@/services/users.service'
import type { UserProfile } from '@/types/user'
import styles from '@/components/admin/AdminCrudPage.module.css'

interface MemberPickerProps {
  selected: UserProfile | null
  onSelect: (member: UserProfile | null) => void
}

export function MemberPicker({ selected, onSelect }: MemberPickerProps) {
  const [members, setMembers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    listAllUsers().then(setMembers)
  }, [])

  const term = search.trim().toLowerCase()
  const matches =
    term.length < 2
      ? []
      : members
          .filter((m) => m.displayName.toLowerCase().includes(term) || m.email.toLowerCase().includes(term))
          .slice(0, 8)

  if (selected) {
    return (
      <div className={styles.row}>
        <span>
          {selected.displayName} · {selected.email}
        </span>
        <span className={styles.rowActions}>
          <button type="button" className={styles.link} onClick={() => onSelect(null)}>
            Cambiar
          </button>
        </span>
      </div>
    )
  }

  return (
    <div>
      <input
        className={styles.input}
        placeholder="Buscar miembro por nombre o email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {matches.map((m) => (
        <button
          key={m.uid}
          type="button"
          className={styles.row}
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
          onClick={() => onSelect(m)}
        >
          <span>
            {m.displayName} · {m.email}
          </span>
        </button>
      ))}
      {term.length >= 2 && matches.length === 0 && (
        <p style={{ color: 'var(--color-ink-400)', fontSize: 13 }}>No se encontraron miembros con "{search}".</p>
      )}
    </div>
  )
}
