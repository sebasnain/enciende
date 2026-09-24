import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { studiesService } from '@/services/content.service'
import type { Study } from '@/types/content'
import { MarkdownView } from '@/components/ui/MarkdownView'
import { Spinner } from '@/components/ui/Spinner'

export function StudyDetail() {
  const { id = '' } = useParams()
  const [item, setItem] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studiesService.get(id).then((result) => {
      setItem(result)
      setLoading(false)
    })
  }, [id])

  if (loading) return <Spinner />
  if (!item) return <p>Estudio no encontrado.</p>

  return (
    <article>
      <h1>{item.title}</h1>
      <p style={{ color: 'var(--color-ink-400)' }}>{item.authorName}</p>
      <MarkdownView content={item.body} />
    </article>
  )
}
