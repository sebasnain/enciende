import { useEffect, useState } from 'react'

const STORAGE_KEY = 'enciende:cart'

function loadCart(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function useCart() {
  const [items, setItems] = useState<string[]>(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }, [items])

  function toggle(id: string) {
    setItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x !== id))
  }

  function clear() {
    setItems([])
  }

  return { items, toggle, remove, clear }
}
