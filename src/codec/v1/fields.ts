import type { ByteReader, ByteWriter } from '@/codec/v1/bytes'
import {
  lookupPathTokenByIndex,
  lookupPathTokenIndex,
  lookupQueryParamTokenByIndex,
  lookupQueryParamTokenIndex,
} from '@/codec/v1/dictionary-v1'

/**
 * Estrategias de codificación de Fase 2 para los campos path/query. `literal`
 * reproduce exactamente el comportamiento de Fase 1. `tokenized`/`compressed`
 * son candidatas adicionales que `select.ts` prueba y descarta si no ganan.
 */
export type PathStrategy = 'literal' | 'tokenized'
export type QueryStrategy = 'literal' | 'compressed'

// ---- path ----

export function encodePathLiteral(writer: ByteWriter, pathname: string): void {
  writer.writeVarintPrefixedString(pathname)
}

export function decodePathLiteral(reader: ByteReader): string {
  return reader.readVarintPrefixedString()
}

/**
 * Codifica el path como una lista de segmentos, cada uno o bien un índice de
 * `PATH_TOKENS_V1` (1 byte marcador + 1 byte índice) o un literal
 * (1 byte marcador + varint-length + utf8). Sólo compensa cuando varios
 * segmentos son tokens frecuentes; si no, `select.ts` prefiere el literal.
 */
export function encodePathTokenized(
  writer: ByteWriter,
  pathname: string,
): void {
  const segments = pathname.split('/').filter((s) => s.length > 0)
  writer.writeVarint(segments.length)
  for (const segment of segments) {
    const tokenIndex = lookupPathTokenIndex(segment)
    if (tokenIndex !== null) {
      writer.writeByte(1)
      writer.writeByte(tokenIndex)
    } else {
      writer.writeByte(0)
      writer.writeVarintPrefixedString(segment)
    }
  }
}

export function decodePathTokenized(reader: ByteReader): string {
  const segmentCount = reader.readVarint()
  const segments: string[] = []
  for (let i = 0; i < segmentCount; i++) {
    const isToken = reader.readByte() === 1
    segments.push(
      isToken
        ? lookupPathTokenByIndex(reader.readByte())
        : reader.readVarintPrefixedString(),
    )
  }
  return `/${segments.join('/')}`
}

// ---- query ----

export function encodeQueryLiteral(writer: ByteWriter, search: string): void {
  writer.writeVarintPrefixedString(search)
}

export function decodeQueryLiteral(reader: ByteReader): string {
  return reader.readVarintPrefixedString()
}

interface QueryPair {
  key: string
  hasValue: boolean
  value: string
}

function splitQueryPairs(search: string): QueryPair[] {
  return search.split('&').map((pair) => {
    const eqIndex = pair.indexOf('=')
    if (eqIndex === -1) return { key: pair, hasValue: false, value: '' }
    return {
      key: pair.slice(0, eqIndex),
      hasValue: true,
      value: pair.slice(eqIndex + 1),
    }
  })
}

/**
 * Codifica la query como pares clave/valor, tokenizando sólo la clave
 * (nunca el valor) contra `QUERY_PARAM_TOKENS_V1`. Preserva el string crudo
 * (ya percent-encoded por la URL nativa) sin volver a decodificarlo, para
 * poder reconstruirlo byte a byte.
 */
export function encodeQueryCompressed(
  writer: ByteWriter,
  search: string,
): void {
  const pairs = splitQueryPairs(search)
  writer.writeVarint(pairs.length)
  for (const pair of pairs) {
    const tokenIndex = lookupQueryParamTokenIndex(pair.key)
    if (tokenIndex !== null) {
      writer.writeByte(1)
      writer.writeByte(tokenIndex)
    } else {
      writer.writeByte(0)
      writer.writeVarintPrefixedString(pair.key)
    }
    writer.writeByte(pair.hasValue ? 1 : 0)
    if (pair.hasValue) writer.writeVarintPrefixedString(pair.value)
  }
}

export function decodeQueryCompressed(reader: ByteReader): string {
  const pairCount = reader.readVarint()
  const parts: string[] = []
  for (let i = 0; i < pairCount; i++) {
    const isToken = reader.readByte() === 1
    const key = isToken
      ? lookupQueryParamTokenByIndex(reader.readByte())
      : reader.readVarintPrefixedString()
    const hasValue = reader.readByte() === 1
    parts.push(hasValue ? `${key}=${reader.readVarintPrefixedString()}` : key)
  }
  return parts.join('&')
}
