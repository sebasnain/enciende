import type { BibleVerse, VerseHighlight } from '@/types/bible'
import { Verse } from './Verse'

interface VerseListProps {
  verses: BibleVerse[]
  highlights: VerseHighlight[]
  notes: Record<number, string>
  onSelect: (verse: number, start: number, end: number) => void
  onRemoveHighlight: (id: string) => void
  onOpenNote: (verse: number) => void
  onSelectWord: (word: string) => void
}

export function VerseList({ verses, highlights, notes, onSelect, onRemoveHighlight, onOpenNote, onSelectWord }: VerseListProps) {
  return (
    <div>
      {verses.map((verse) => (
        <Verse
          key={verse.verse}
          number={verse.verse}
          html={verse.text}
          highlights={highlights.filter((h) => h.verse === verse.verse)}
          note={notes[verse.verse]}
          onOpenNote={() => onOpenNote(verse.verse)}
          onSelect={onSelect}
          onRemoveHighlight={onRemoveHighlight}
          onSelectWord={onSelectWord}
        />
      ))}
    </div>
  )
}
