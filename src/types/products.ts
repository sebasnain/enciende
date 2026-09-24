export const PRODUCT_CATEGORIES = ['Biblias', 'Niños', 'Estudio bíblico', 'Biografías', 'Devocionales', 'Regalería'] as const

export interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice: number | null
  imageURL: string
  description: string
  available: boolean
}

export interface LiveSettings {
  scheduleDay: number
  scheduleHour: number
  scheduleMinute: number
  durationMinutes: number
  channelUrl: string
  manualActive: boolean
  manualVideoId: string | null
}

export interface SocialSettings {
  facebook: string | null
  instagram: string | null
  whatsapp: string | null
  youtube: string | null
  website: string | null
  address: string | null
  mapUrl: string | null
}
