import { useState } from 'react'
import type { TranslationCode } from '@/types/bible'
import { Modal } from '@/components/ui/Modal'
import { Icon } from '@/components/ui/Icon'
import styles from './VersionSwitcher.module.css'

const VERSIONS: { code: TranslationCode; label: string; fullName: string }[] = [
  { code: 'NVI', label: 'NVI', fullName: 'Nueva Versión Internacional' },
  { code: 'RV1960', label: 'RVR60', fullName: 'Reina-Valera 1960' },
  { code: 'RV2004', label: 'RVG04', fullName: 'Reina Valera Gómez 2004' },
  { code: 'NTV', label: 'NTV', fullName: 'Nueva Traducción Viviente' },
  { code: 'LBLA', label: 'LBLA', fullName: 'La Biblia de las Américas' },
  { code: 'PDT', label: 'PDT', fullName: 'Palabra de Dios para Todos' },
  { code: 'BTX3', label: 'BTX3', fullName: 'La Biblia Textual, 3ra Edición' },
]

export function VersionSwitcher({
  value,
  onChange,
}: {
  value: TranslationCode
  onChange: (translation: TranslationCode) => void
}) {
  const [open, setOpen] = useState(false)
  const current = VERSIONS.find((v) => v.code === value)

  return (
    <>
      <button className={styles.trigger} onClick={() => setOpen(true)}>
        {current?.label ?? value}
        <Icon name="chevron-down" />
      </button>

      {open && (
        <Modal title="Elegí una versión" onClose={() => setOpen(false)}>
          <div className={styles.list}>
            {VERSIONS.map((version) => (
              <button
                key={version.code}
                className={`${styles.item} ${value === version.code ? styles.itemActive : ''}`}
                onClick={() => {
                  onChange(version.code)
                  setOpen(false)
                }}
              >
                <span className={styles.itemLabel}>{version.label}</span>
                <span className={styles.itemName}>{version.fullName}</span>
                {value === version.code && <Icon name="check-lg" />}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}
