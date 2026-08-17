import { stripTrackingParams } from '@/security/stripTracking'
import { MAX_INPUT_URL_LENGTH } from '@/security/limits'

export class NormalizeError extends Error {}

const ALLOWED_SCHEMES = new Set(['http:', 'https:'])

export interface NormalizeDetails {
  url: string
  removedTrackingParams: number
}

/**
 * Normaliza una URL de entrada: exige http(s), recorta espacios accidentales,
 * normaliza hostname/punycode y percent-encoding vía la URL nativa, elimina
 * parámetros de tracking conocidos (siempre, sin opción de desactivarlo), y
 * rechaza esquemas peligrosos (`javascript:`, `data:`, `file:`, etc.).
 * Lanza `NormalizeError` para cualquier entrada inválida; nunca redirige.
 */
export function normalizeUrlWithDetails(input: string): NormalizeDetails {
  const trimmed = input.trim()

  if (trimmed.length === 0) {
    throw new NormalizeError('la URL está vacía')
  }
  if (trimmed.length > MAX_INPUT_URL_LENGTH) {
    throw new NormalizeError(
      `la URL supera el máximo de ${MAX_INPUT_URL_LENGTH} caracteres`,
    )
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new NormalizeError('la URL es inválida o está malformada')
  }

  if (!ALLOWED_SCHEMES.has(url.protocol)) {
    throw new NormalizeError(`esquema no permitido: ${url.protocol}`)
  }

  const removedTrackingParams = stripTrackingParams(url)

  return { url: url.toString(), removedTrackingParams }
}

export function normalizeUrl(input: string): string {
  return normalizeUrlWithDetails(input).url
}
