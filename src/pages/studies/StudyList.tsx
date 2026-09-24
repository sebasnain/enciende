import { useEffect, useState } from 'react'
import { studiesService } from '@/services/content.service'
import type { Study } from '@/types/content'
import { ListCard } from '@/components/ui/ListCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function StudyList() {
  const [items, setItems] = useState<Study[] | null>(null)

  useEffect(() => {
    studiesService.list().then(setItems)
  }, [])

  if (!items) return <Spinner />
  if (items.length === 0) return <EmptyState message="Todavía no hay estudios publicados." />

  return (
    <div>
      <h1>Estudios bíblicos</h1>
      {items.map((item) => (
        <ListCard key={item.id} to={`/estudios/${item.id}`} title={item.title} subtitle={item.series ?? item.authorName} coverImage={item.coverImage} />
      ))}
    </div>
  )
}
