import { fromBase45, toBase45 } from '@/codec/base45'
import { fromBase64Url, toBase64Url } from '@/codec/base64url'
import { decodeUrl } from '@/codec/v1/decode'
import { selectBestEncoding } from '@/codec/v1/select'
import { MAX_PAYLOAD_STRING_LENGTH } from '@/security/limits'

export type DecodeResult =
  { ok: true; url: string } | { ok: false; reason: string }

interface VersionCodec {
  decodeBody(body: string): string
}

/**
 * Un decodificador por versión, indexado por su prefijo literal. Nunca se
 * modifica un decodificador ya publicado de forma incompatible: una v2
 * añadiría una entrada nueva, no tocaría "v1"/"V1".
 */
const WEB_CODECS: Record<string, VersionCodec> = {
  v1: { decodeBody: (body) => decodeUrl(fromBase64Url(body)) },
}

const QR_CODECS: Record<string, VersionCodec> = {
  V1: { decodeBody: (body) => decodeUrl(fromBase45(body)) },
}

/**
 * Bytes codificados del codec v1, antes de elegir alfabeto de texto. Usa el
 * selector adaptativo de Fase 2 (prueba estrategias de path/query y elige la
 * más corta, siempre auto-verificada por round-trip).
 */
export function encodeUrlV1(normalizedUrl: string): Uint8Array {
  return selectBestEncoding(normalizedUrl).bytes
}

export function encodeToWebFragment(normalizedUrl: string): string {
  return `v1.${toBase64Url(encodeUrlV1(normalizedUrl))}`
}

export function encodeToQrPath(normalizedUrl: string): string {
  return `V1.${toBase45(encodeUrlV1(normalizedUrl))}`
}

function decodeWithRegistry(
  raw: string,
  codecs: Record<string, VersionCodec>,
): DecodeResult {
  if (raw.length === 0) {
    return { ok: false, reason: 'payload vacío' }
  }
  if (raw.length > MAX_PAYLOAD_STRING_LENGTH) {
    return { ok: false, reason: 'payload demasiado largo' }
  }

  const separatorIndex = raw.indexOf('.')
  if (separatorIndex === -1) {
    return { ok: false, reason: 'payload sin versión explícita' }
  }

  const version = raw.slice(0, separatorIndex)
  const body = raw.slice(separatorIndex + 1)
  const codec = codecs[version]
  if (!codec) {
    return { ok: false, reason: `versión de payload desconocida: ${version}` }
  }

  try {
    return { ok: true, url: codec.decodeBody(body) }
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'payload inválido',
    }
  }
}

/** Decodifica el payload del enlace web (`#v1.<payload>`, sin el `#`). */
export function decodeWebPayload(raw: string): DecodeResult {
  return decodeWithRegistry(raw, WEB_CODECS)
}

/** Decodifica el payload del enlace QR (`/q/V1.<payload>`, sin el `/q/`). */
export function decodeQrPayload(raw: string): DecodeResult {
  return decodeWithRegistry(raw, QR_CODECS)
}
