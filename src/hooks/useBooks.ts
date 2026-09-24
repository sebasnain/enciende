import { useEffect, useState } from 'react'
import { getBooksFromCache } from '@/services/bibleCache'
import { getBooks } from '@/services/bolls/translations'
import type { BibleBook, TranslationCode } from '@/types/bible'

const memoryCache = new Map<TranslationCode, BibleBook[]>()

export function useBooks(translation: TranslationCode) {
  const [books, setBooks] = useState<BibleBook[]>(memoryCache.get(translation) ?? [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (memoryCache.has(translation)) {
        setBooks(memoryCache.get(translation)!)
        return
      }
      const cached = await getBooksFromCache(translation)
      const result = cached ?? (await getBooks(translation))
      memoryCache.set(translation, result)
      if (!cancelled) setBooks(result)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [translation])

  return books
}
