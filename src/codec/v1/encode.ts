import { ByteWriter } from '@/codec/v1/bytes'
import { appendChecksum } from '@/codec/checksum'
import { lookupHostIndex } from '@/codec/v1/dictionary-v1'
import {
  encodePathLiteral,
  encodePathTokenized,
  encodeQueryCompressed,
  encodeQueryLiteral,
  type PathStrategy,
  type QueryStrategy,
} from '@/codec/v1/fields'
import {
  EXT_FLAG_PATH_TOKENIZED,
  EXT_FLAG_QUERY_COMPRESSED,
  FLAG_EXTENDED,
  FLAG_HAS_FRAGMENT,
  FLAG_HAS_PATH,
  FLAG_HAS_PORT,
  FLAG_HAS_QUERY,
  FLAG_HOST_DICT,
  FLAG_SCHEME_HTTP,
  FLAG_WWW,
} from '@/codec/v1/flags'

export interface EncodeStrategies {
  path?: PathStrategy
  query?: QueryStrategy
}

/**
 * Codifica una URL ya normalizada (ver `normalizeUrl`) al layout binario v1,
 * incluido el checksum CRC32 final. Único punto de codificación: tanto el
 * enlace web (base64url) como el enlace QR (base45) derivan de estos mismos
 * bytes, garantizando que ambos formatos apunten siempre al mismo destino.
 *
 * `strategies` son las estrategias de campo de Fase 2 (ver `select.ts` para
 * la búsqueda combinatoria que las prueba todas y elige la más corta). Con
 * los valores por defecto ('literal'/'literal') produce bytes idénticos a
 * la implementación de Fase 1: el byte de flags extendidas sólo se emite
 * cuando alguna estrategia no-literal está en uso.
 */
export function encodeUrl(
  normalizedUrl: string,
  strategies: EncodeStrategies = {},
): Uint8Array {
  const pathStrategy = strategies.path ?? 'literal'
  const queryStrategy = strategies.query ?? 'literal'

  const url = new URL(normalizedUrl)
  const writer = new ByteWriter()

  let flags = 0
  if (url.protocol === 'http:') flags |= FLAG_SCHEME_HTTP

  let hostname = url.hostname
  if (hostname.startsWith('www.')) {
    flags |= FLAG_WWW
    hostname = hostname.slice(4)
  }

  const dictIndex = lookupHostIndex(hostname)
  if (dictIndex !== null) flags |= FLAG_HOST_DICT

  const hasPort = url.port !== ''
  if (hasPort) flags |= FLAG_HAS_PORT

  const hasPath = url.pathname !== '' && url.pathname !== '/'
  if (hasPath) flags |= FLAG_HAS_PATH

  const hasQuery = url.search !== ''
  if (hasQuery) flags |= FLAG_HAS_QUERY

  const hasFragment = url.hash !== ''
  if (hasFragment) flags |= FLAG_HAS_FRAGMENT

  let extFlags = 0
  if (hasPath && pathStrategy === 'tokenized')
    extFlags |= EXT_FLAG_PATH_TOKENIZED
  if (hasQuery && queryStrategy === 'compressed')
    extFlags |= EXT_FLAG_QUERY_COMPRESSED
  if (extFlags !== 0) flags |= FLAG_EXTENDED

  writer.writeByte(flags)
  if (extFlags !== 0) writer.writeByte(extFlags)

  if (dictIndex !== null) {
    writer.writeByte(dictIndex)
  } else {
    writer.writeVarintPrefixedString(hostname)
  }

  if (hasPort) writer.writeVarint(Number(url.port))

  if (hasPath) {
    if (extFlags & EXT_FLAG_PATH_TOKENIZED) {
      encodePathTokenized(writer, url.pathname)
    } else {
      encodePathLiteral(writer, url.pathname)
    }
  }

  if (hasQuery) {
    const search = url.search.slice(1)
    if (extFlags & EXT_FLAG_QUERY_COMPRESSED) {
      encodeQueryCompressed(writer, search)
    } else {
      encodeQueryLiteral(writer, search)
    }
  }

  if (hasFragment) writer.writeVarintPrefixedString(url.hash.slice(1))

  return appendChecksum(writer.toUint8Array())
}
