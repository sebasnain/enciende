const BASE = 'https://bolls.life'

export async function bollsFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    throw new Error(`Bolls.life request failed (${res.status}): ${path}`)
  }
  return res.json() as Promise<T>
}

export const bollsStaticUrl = {
  translationDump: (translation: string) => `${BASE}/static/translations/${translation}.json`,
}
