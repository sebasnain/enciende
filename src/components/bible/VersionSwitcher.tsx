import type { TranslationCode } from '@/types/bible'
import styles from './VersionSwitcher.module.css'

const VERSIONS: { code: TranslationCode; label: string }[] = [
  { code: 'NVI', label: 'NVI' },
  { code: 'RV1960', label: 'RVR60' },
]

export function VersionSwitcher({
  value,
  onChange,
}: {
  value: TranslationCode
  onChange: (translation: TranslationCode) => void
}) {
  return (
    <div className={styles.switcher}>
      {VERSIONS.map((version) => (
        <button
          key={version.code}
          className={`${styles.option} ${value === version.code ? styles.active : ''}`}
          onClick={() => onChange(version.code)}
        >
          {version.label}
        </button>
      ))}
    </div>
  )
}
