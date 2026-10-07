import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { TranslationCode } from '@/types/bible'
import { DEFAULT_TRANSLATION, usableTranslation } from '@/utils/translations'

const STORAGE_KEY = 'enciende:last-position'

interface BiblePosition {
  translation: TranslationCode
  book: number
  chapter: number
}

const DEFAULT_POSITION: BiblePosition = { translation: DEFAULT_TRANSLATION, book: 43, chapter: 3 }

interface BibleContextValue {
  position: BiblePosition
  setPosition: (position: BiblePosition) => void
}

const BibleContext = createContext<BibleContextValue | null>(null)

function loadStoredPosition(): BiblePosition {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_POSITION
    const stored = JSON.parse(raw) as BiblePosition
    // Quien tenía guardada una traducción que ya no está disponible sigue en el mismo libro y capítulo, con la predeterminada.
    return { ...stored, translation: usableTranslation(stored.translation) }
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
