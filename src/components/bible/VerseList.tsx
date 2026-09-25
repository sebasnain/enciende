import { useMemo } from 'react'
import type { BibleVerse, VerseHighlight } from '@/types/bible'
import { Verse } from './Verse'

const NONE: VerseHighlight[] = []

interface VerseListProps {
  verses: BibleVerse[]
  highlights: VerseHighlight[]
  notes: Record<number, string>
  onOpenNote: (verse: number) => void
  onLookupWord: (word: string) => void
}

export function VerseList({ verses, highlights, notes, onOpenNote, onLookupWord }: VerseListProps) {
  const byVerse = useMemo(() => {
    const map = new Map<number, VerseHighlight[]>()
    for (const h of highlights) {
      const list = map.get(h.verse)
      if (list) list.push(h)
      else map.set(h.verse, [h])
    }
    return map
  }, [highlights])

  return (
    <div>
      {verses.map((verse) => (
        <Verse
          key={verse.verse}
          number={verse.verse}
          html={verse.text}
          highlights={byVerse.get(verse.verse) ?? NONE}
          note={notes[verse.verse]}
          onOpenNote={onOpenNote}
          onLookupWord={onLookupWord}
        />
      ))}
    </div>
  )
}
