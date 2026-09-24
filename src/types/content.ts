export interface Devotional {
  id: string
  title: string
  body: string
  authorId: string
  authorName: string
  coverImage: string | null
  publishedAt: number
  tags: string[]
}

export interface Study {
  id: string
  title: string
  body: string
  authorId: string
  authorName: string
  coverImage: string | null
  publishedAt: number
  series: string | null
}
