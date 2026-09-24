import { useState } from 'react'
import type { BibleBook } from '@/types/bible'
import { Modal } from '@/components/ui/Modal'
import styles from './ChapterNavigator.module.css'

interface ChapterNavigatorProps {
  books: BibleBook[]
  bookId: number
  chapter: number
  onNavigate: (bookId: number, chapter: number) => void
}

export function ChapterNavigator({ books, bookId, chapter, onNavigate }: ChapterNavigatorProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const currentBook = books.find((b) => b.bookid === bookId)

  function goPrev() {
    if (!currentBook) return
    if (chapter > 1) return onNavigate(bookId, chapter - 1)
    const idx = books.findIndex((b) => b.bookid === bookId)
    const prevBook = books[idx - 1]
    if (prevBook) onNavigate(prevBook.bookid, prevBook.chapters)
  }

  function goNext() {
    if (!currentBook) return
    if (chapter < currentBook.chapters) return onNavigate(bookId, chapter + 1)
    const idx = books.findIndex((b) => b.bookid === bookId)
    const nextBook = books[idx + 1]
    if (nextBook) onNavigate(nextBook.bookid, 1)
  }

  return (
    <div className={styles.nav}>
      <button className={styles.arrow} onClick={goPrev} aria-label="Capítulo anterior">
        ‹
      </button>
      <button className={styles.title} onClick={() => setPickerOpen(true)}>
        {currentBook?.name ?? '...'} {chapter}
      </button>
      <button className={styles.arrow} onClick={goNext} aria-label="Capítulo siguiente">
        ›
      </button>

      {pickerOpen && (
        <Modal title="Ir a..." onClose={() => setPickerOpen(false)}>
          <div className={styles.bookGrid}>
            {books.map((book) => (
              <div key={book.bookid} className={styles.bookBlock}>
                <p className={styles.bookName}>{book.name}</p>
                <div className={styles.chapterGrid}>
                  {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      className={styles.chapterButton}
                      onClick={() => {
                        onNavigate(book.bookid, ch)
                        setPickerOpen(false)
                      }}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
