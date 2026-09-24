import { useEffect, useState } from 'react'
import { downloadTranslation, getChapterFromCache, isTranslationCached } from '@/services/bibleCache'
import { getChapterText } from '@/services/bolls/chapters'
import type { BibleVerse, TranslationCode } from '@/types/bible'

interface ChapterState {
  verses: BibleVerse[]
  loading: boolean
  error: string | null
  cached: boolean
  downloading: boolean
  download: () => Promise<void>
}

export function useBibleChapter(translation: TranslationCode, bookId: number, chapter: number): ChapterState {
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const isCached = await isTranslationCached(translation)
      setCached(isCached)
      if (isCached) {
        const cachedVerses = await getChapterFromCache(translation, bookId, chapter)
        setVerses(cachedVerses ?? [])
      } else {
        const remoteVerses = await getChapterText(translation, bookId, chapter)
        setVerses(remoteVerses)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el capítulo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translation, bookId, chapter])

  async function download() {
    setDownloading(true)
    try {
      await downloadTranslation(translation)
      setCached(true)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo descargar la versión')
    } finally {
      setDownloading(false)
    }
  }

  return { verses, loading, error, cached, downloading, download }
}
