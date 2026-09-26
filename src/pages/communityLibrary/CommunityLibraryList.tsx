import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { listAllCopies, listLibraryTitles } from '@/services/library.service'
import type { LibraryCopy, LibraryTitle } from '@/types/library'
import { ListCard } from '@/components/ui/ListCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './CommunityLibrary.module.css'

export function CommunityLibraryList() {
  const { user } = useAuth()
  const [titles, setTitles] = useState<LibraryTitle[] | null>(null)
  const [copies, setCopies] = useState<LibraryCopy[]>([])
  const [loadError, setLoadError] = useState(false)
  const [category, setCategory] = useState('Todas')

  useEffect(() => {
    listLibraryTitles()
      .then(setTitles)
      .catch(() => setLoadError(true))
    listAllCopies()
      .then(setCopies)
      .catch(() => {})
  }, [])

  const availabilityByTitle = useMemo(() => {
    const map = new Map<string, { available: number; total: number }>()
    for (const copy of copies) {
      const entry = map.get(copy.titleId) ?? { available: 0, total: 0 }
      entry.total += 1
      if (copy.status === 'disponible') entry.available += 1
      map.set(copy.titleId, entry)
    }
    return map
  }, [copies])

  const categories = useMemo(() => {
    if (!titles) return []
    const present = new Set(titles.map((t) => t.category).filter(Boolean))
    return ['Todas', ...Array.from(present)]
  }, [titles])

  const visibleTitles = useMemo(() => {
    if (!titles) return []
    return category === 'Todas' ? titles : titles.filter((t) => t.category === category)
  }, [titles, category])

  if (loadError) return <EmptyState message="No se pudo cargar la biblioteca. Probá de nuevo en un momento." />
  if (!titles) return <Spinner />

  return (
    <div>
      <div className={styles.header}>
        <h1>Biblioteca comunitaria</h1>
        {user && (
          <Link to="/biblioteca/mis-prestamos" className={styles.myLoansLink}>
            Mis préstamos
          </Link>
        )}
      </div>

      {titles.length === 0 ? (
        <EmptyState message="Todavía no hay libros cargados en la biblioteca." />
      ) : (
        <>
          {categories.length > 1 && (
            <div className={styles.categoryRow}>
              {categories.map((c) => (
                <button
                  key={c}
                  className={`${styles.categoryChip} ${category === c ? styles.categoryChipActive : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {visibleTitles.map((title) => {
            const availability = availabilityByTitle.get(title.id)
            const subtitle = [
              title.author,
              availability ? `${availability.available} de ${availability.total} disponibles` : 'Sin ejemplares cargados',
            ]
              .filter(Boolean)
              .join(' · ')
            return (
              <ListCard key={title.id} to={`/biblioteca/${title.id}`} title={title.title} subtitle={subtitle} coverImage={title.coverImageUrl} />
            )
          })}
        </>
      )}
    </div>
  )
}
