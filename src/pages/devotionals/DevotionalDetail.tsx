import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { devotionalsService } from '@/services/content.service'
import type { Devotional } from '@/types/content'
import { MarkdownView } from '@/components/ui/MarkdownView'
import { Spinner } from '@/components/ui/Spinner'

export function DevotionalDetail() {
  const { id = '' } = useParams()
  const [item, setItem] = useState<Devotional | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    devotionalsService.get(id).then((result) => {
      setItem(result)
      setLoading(false)
    })
  }, [id])

  if (loading) return <Spinner />
  if (!item) return <p>Devocional no encontrado.</p>

  return (
    <article>
      <h1>{item.title}</h1>
      <p style={{ color: 'var(--color-ink-400)' }}>{item.authorName}</p>
      <MarkdownView content={item.body} />
    </article>
  )
}
