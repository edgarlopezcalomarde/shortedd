export type PayloadKind = 'web' | 'qr'

export interface DetectedPayload {
  kind: PayloadKind
  /** Contenido tras `#` (web) o tras `/q/` (QR), sin decodificar todavía. */
  raw: string
}

interface LocationLike {
  hash: string
  pathname: string
}

const QR_PATH_PREFIX = '/q/'

/**
 * Detecta un payload de enlace en `hash`/`pathname`, restando el prefijo de
 * `basePath` (p. ej. `/shortedd/` en una GitHub Pages project page) antes de
 * comparar con `/q/`. Función pura para poder testear sin navegación real.
 */
export function detectPayload(
  location: LocationLike,
  basePath: string,
): DetectedPayload | null {
  if (location.hash.length > 1) {
    return { kind: 'web', raw: location.hash.slice(1) }
  }

  const basePrefix = basePath.replace(/\/$/, '')
  let pathname = location.pathname
  if (basePrefix !== '' && pathname.startsWith(basePrefix)) {
    pathname = pathname.slice(basePrefix.length)
  }

  if (pathname.startsWith(QR_PATH_PREFIX)) {
    return { kind: 'qr', raw: pathname.slice(QR_PATH_PREFIX.length) }
  }

  return null
}

export function detectPayloadFromWindow(): DetectedPayload | null {
  return detectPayload(window.location, import.meta.env.BASE_URL)
}
