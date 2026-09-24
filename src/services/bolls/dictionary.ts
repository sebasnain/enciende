import { bollsFetch } from './client'
import type { DictionaryEntry } from '@/types/bible'

const DICTIONARY = 'BDBT'

export function getDefinition(query: string) {
  return bollsFetch<DictionaryEntry[]>(`/dictionary-definition/${DICTIONARY}/${encodeURIComponent(query)}/`)
}
