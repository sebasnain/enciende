export interface PassageRef {
  book: number
  bookName: string
  chapter: number
  verseStart?: number
  verseEnd?: number
}

export interface ReadingPlan {
  id: string
  title: string
  description: string
  coverImage: string | null
  durationDays: number
  category: string
  published: boolean
  createdAt: number
}

export interface ReadingPlanDay {
  id: string
  order: number
  title: string
  passageRefs: PassageRef[]
  devotionalText: string
}

export interface PlanProgress {
  planId: string
  enrolledAt: number
  completedDayIds: Record<string, true>
  updatedAt: number
}
