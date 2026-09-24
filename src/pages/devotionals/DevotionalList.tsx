import { useEffect, useState } from 'react'
import { devotionalsService } from '@/services/content.service'
import type { Devotional } from '@/types/content'
import { ListCard } from '@/components/ui/ListCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function DevotionalList() {
  const [items, setItems] = useState<Devotional[] | null>(null)

  useEffect(() => {
    devotionalsService.list().then(setItems)
  }, [])

  if (!items) return <Spinner />
  if (items.length === 0) return <EmptyState message="Todavía no hay devocionales publicados." />

  return (
    <div>
      <h1>Devocionales</h1>
      {items.map((item) => (
        <ListCard key={item.id} to={`/devocionales/${item.id}`} title={item.title} subtitle={item.authorName} coverImage={item.coverImage} />
      ))}
    </div>
  )
}
