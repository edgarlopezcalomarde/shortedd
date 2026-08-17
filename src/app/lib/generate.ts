import {
  encodeToQrPath,
  encodeToWebFragment,
  encodeUrlV1,
} from '@/codec/v1/registry'
import { MAX_QR_PAYLOAD_BYTES } from '@/security/limits'

export type QrAvailability =
  | { available: true; link: string; payload: string; encodedBytes: number }
  | { available: false; reason: string }

export interface GenerationResult {
  normalizedUrl: string
  webLink: string
  qr: QrAvailability
}

/**
 * Deriva el enlace web y (si cabe) el enlace QR a partir de la misma URL
 * normalizada. `origin`/`basePath` permiten construir enlaces absolutos
 * correctos tanto en una GitHub Pages project page (`/repo/`) como en una
 * página raíz o dominio propio (`/`).
 */
export function generateLinks(
  normalizedUrl: string,
  origin: string,
  basePath: string,
): GenerationResult {
  const bytes = encodeUrlV1(normalizedUrl)
  const webFragment = encodeToWebFragment(normalizedUrl)
  const webLink = `${origin}${basePath}#${webFragment}`

  if (bytes.length > MAX_QR_PAYLOAD_BYTES) {
    return {
      normalizedUrl,
      webLink,
      qr: {
        available: false,
        reason:
          'URL demasiado larga para QR de alta densidad. Usa el enlace web.',
      },
    }
  }

  const qrPayload = encodeToQrPath(normalizedUrl)
  return {
    normalizedUrl,
    webLink,
    qr: {
      available: true,
      link: `${origin}${basePath}q/${qrPayload}`,
      payload: qrPayload,
      encodedBytes: bytes.length,
    },
  }
}
