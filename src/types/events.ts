export interface ChurchEvent {
  id: string
  title: string
  description: string
  startAt: number
  endAt: number | null
  location: string | null
  category: string
}
