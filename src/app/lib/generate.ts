import { encodeToWebFragment } from '@/codec/v1/registry'

export interface GenerationResult {
  normalizedUrl: string
  webLink: string
}

/**
 * Deriva el enlace web a partir de la URL normalizada. `origin`/`basePath`
 * permiten construir enlaces absolutos correctos tanto en una GitHub Pages
 * project page (`/repo/`) como en una página raíz o dominio propio (`/`).
 */
export function generateLinks(
  normalizedUrl: string,
  origin: string,
  basePath: string,
): GenerationResult {
  const webFragment = encodeToWebFragment(normalizedUrl)
  const webLink = `${origin}${basePath}#${webFragment}`

  return { normalizedUrl, webLink }
}
