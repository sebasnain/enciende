import { bollsFetch } from './client'
import type { BibleBook } from '@/types/bible'

interface LanguageEntry {
  short_name: string
  full_name: string
}

export function getLanguages() {
  return bollsFetch<LanguageEntry[]>('/static/bolls/app/views/languages.json')
}

export function getBooks(translation: string) {
  return bollsFetch<BibleBook[]>(`/get-books/${translation}/`)
}
