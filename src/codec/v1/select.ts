import { decodeUrl } from '@/codec/v1/decode'
import { encodeUrl } from '@/codec/v1/encode'
import type { PathStrategy, QueryStrategy } from '@/codec/v1/fields'

const PATH_STRATEGIES: readonly PathStrategy[] = ['literal', 'tokenized']
const QUERY_STRATEGIES: readonly QueryStrategy[] = ['literal', 'compressed']

export interface SelectedEncoding {
  bytes: Uint8Array
  pathStrategy: PathStrategy
  queryStrategy: QueryStrategy
}

/**
 * Prueba todas las combinaciones de estrategias de path/query (host ya usa
 * el diccionario de forma greedy en `encodeUrl`, sin necesidad de búsqueda:
 * un índice de 1 byte nunca pierde frente al literal), descarta cualquier
 * candidato cuyo round-trip no reproduzca exactamente la URL normalizada de
 * entrada, y devuelve el candidato válido más corto por bytes.
 *
 * Este auto-verificado es lo que garantiza "nunca produce un enlace
 * incorrecto": ningún candidato se compara por tamaño sin antes haber
 * demostrado que decodifica exactamente al mismo destino.
 */
export function selectBestEncoding(normalizedUrl: string): SelectedEncoding {
  let best: SelectedEncoding | null = null

  for (const path of PATH_STRATEGIES) {
    for (const query of QUERY_STRATEGIES) {
      let bytes: Uint8Array
      try {
        bytes = encodeUrl(normalizedUrl, { path, query })
      } catch {
        continue
      }

      let decoded: string
      try {
        decoded = decodeUrl(bytes)
      } catch {
        continue
      }
      if (decoded !== normalizedUrl) continue

      if (best === null || bytes.length < best.bytes.length) {
        best = { bytes, pathStrategy: path, queryStrategy: query }
      }
    }
  }

  if (best === null) {
    // El literal puro debe verificar siempre; si esto ocurre hay un bug de codec.
    throw new Error('no se encontró ninguna codificación válida para la URL')
  }

  return best
}
