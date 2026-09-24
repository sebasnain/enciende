import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { TranslationCode } from '@/types/bible'

const STORAGE_KEY = 'enciende:last-position'

interface BiblePosition {
  translation: TranslationCode
  book: number
  chapter: number
}

const DEFAULT_POSITION: BiblePosition = { translation: 'NVI', book: 43, chapter: 3 }

interface BibleContextValue {
  position: BiblePosition
  setPosition: (position: BiblePosition) => void
}

const BibleContext = createContext<BibleContextValue | null>(null)

function loadStoredPosition(): BiblePosition {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BiblePosition) : DEFAULT_POSITION
  } catch {
    return DEFAULT_POSITION
  }
}

export function BibleProvider({ children }: { children: ReactNode }) {
  const [position, setPositionState] = useState<BiblePosition>(loadStoredPosition)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position))
  }, [position])

  function setPosition(next: BiblePosition) {
    setPositionState(next)
  }

  return <BibleContext.Provider value={{ position, setPosition }}>{children}</BibleContext.Provider>
}

export function useBiblePosition() {
  const ctx = useContext(BibleContext)
  if (!ctx) throw new Error('useBiblePosition debe usarse dentro de BibleProvider')
  return ctx
}
