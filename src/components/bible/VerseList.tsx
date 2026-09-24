import type { BibleVerse, VerseHighlight } from '@/types/bible'
import { Verse } from './Verse'

interface VerseListProps {
  verses: BibleVerse[]
  highlights: Record<number, VerseHighlight>
  selectedVerse: number | null
  onSelectVerse: (verse: number) => void
  onSelectWord: (word: string) => void
}

export function VerseList({ verses, highlights, selectedVerse, onSelectVerse, onSelectWord }: VerseListProps) {
  return (
    <div>
      {verses.map((verse) => (
        <Verse
          key={verse.verse}
          number={verse.verse}
          html={verse.text}
          highlight={highlights[verse.verse]}
          selected={selectedVerse === verse.verse}
          onSelectVerse={() => onSelectVerse(verse.verse)}
          onSelectWord={onSelectWord}
        />
      ))}
    </div>
  )
}
