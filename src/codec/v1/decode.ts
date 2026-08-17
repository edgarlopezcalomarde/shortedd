import { ByteReader } from '@/codec/v1/bytes'
import { splitAndVerifyChecksum } from '@/codec/checksum'
import { lookupHostByIndex } from '@/codec/v1/dictionary-v1'
import {
  decodePathLiteral,
  decodePathTokenized,
  decodeQueryCompressed,
  decodeQueryLiteral,
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

export class DecodeError extends Error {}

/**
 * Decodifica bytes en layout binario v1 (con checksum) de vuelta a una URL
 * completa. Lanza `DecodeError` (o el error de checksum) ante cualquier
 * payload corrupto o malformado; nunca produce una URL parcial.
 */
export function decodeUrl(bytes: Uint8Array): string {
  const payload = splitAndVerifyChecksum(bytes)
  const reader = new ByteReader(payload)

  const flags = reader.readByte()
  const scheme = flags & FLAG_SCHEME_HTTP ? 'http:' : 'https:'
  const hasWww = (flags & FLAG_WWW) !== 0
  const hostIsDict = (flags & FLAG_HOST_DICT) !== 0
  const hasPort = (flags & FLAG_HAS_PORT) !== 0
  const hasPath = (flags & FLAG_HAS_PATH) !== 0
  const hasQuery = (flags & FLAG_HAS_QUERY) !== 0
  const hasFragment = (flags & FLAG_HAS_FRAGMENT) !== 0
  const hasExtended = (flags & FLAG_EXTENDED) !== 0

  const extFlags = hasExtended ? reader.readByte() : 0
  const pathTokenized = (extFlags & EXT_FLAG_PATH_TOKENIZED) !== 0
  const queryCompressed = (extFlags & EXT_FLAG_QUERY_COMPRESSED) !== 0

  let hostname = hostIsDict
    ? lookupHostByIndex(reader.readByte())
    : reader.readVarintPrefixedString()
  if (hasWww) hostname = `www.${hostname}`

  const port = hasPort ? reader.readVarint() : null

  const path = hasPath
    ? pathTokenized
      ? decodePathTokenized(reader)
      : decodePathLiteral(reader)
    : '/'

  const query = hasQuery
    ? queryCompressed
      ? decodeQueryCompressed(reader)
      : decodeQueryLiteral(reader)
    : ''

  const fragment = hasFragment ? reader.readVarintPrefixedString() : ''

  if (reader.remaining !== 0) {
    throw new DecodeError('payload inválido: bytes sobrantes tras decodificar')
  }

  let result = `${scheme}//${hostname}`
  if (port !== null) result += `:${port}`
  result += path
  if (query !== '') result += `?${query}`
  if (fragment !== '') result += `#${fragment}`

  try {
    return new URL(result).toString()
  } catch {
    throw new DecodeError('payload inválido: no reconstruye una URL válida')
  }
}
