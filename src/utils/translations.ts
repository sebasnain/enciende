import type { TranslationCode } from '@/types/bible'

export const DEFAULT_TRANSLATION: TranslationCode = 'RV1960'

/**
 * Traducciones que la fuente (bolls.life) ya no entrega: la editorial retiró la autorización y en vez de la Biblia
 * devuelve un mensaje en cada versículo. NVI queda acá hasta que vuelva a haber texto real.
 */
const UNAVAILABLE: Partial<Record<TranslationCode, string>> = {
  NVI: 'No disponible por derechos de autor',
}

export function unavailableReason(translation: string): string | null {
  return UNAVAILABLE[translation as TranslationCode] ?? null
}

/** La traducción pedida, o la predeterminada si esa ya no está disponible (links o posiciones guardadas viejas). */
export function usableTranslation(translation: string | undefined): TranslationCode {
  if (!translation || unavailableReason(translation)) return DEFAULT_TRANSLATION
  return translation as TranslationCode
}
