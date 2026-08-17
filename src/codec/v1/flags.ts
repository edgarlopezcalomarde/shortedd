/** Bitfield del primer byte de flags v1. */
export const FLAG_SCHEME_HTTP = 1 << 0
export const FLAG_WWW = 1 << 1
export const FLAG_HOST_DICT = 1 << 2
export const FLAG_HAS_PORT = 1 << 3
export const FLAG_HAS_PATH = 1 << 4
export const FLAG_HAS_QUERY = 1 << 5
export const FLAG_HAS_FRAGMENT = 1 << 6
/**
 * Si está activo, un segundo byte de flags extendidas sigue inmediatamente
 * al primero. Sólo se emite cuando alguna estrategia de Fase 2 (path
 * tokenizado, query comprimida) está en uso, así que los payloads que sólo
 * usan literales (Fase 1) ocupan exactamente los mismos bytes que antes.
 */
export const FLAG_EXTENDED = 1 << 7

/** Bitfield del segundo byte de flags v1 (sólo presente si FLAG_EXTENDED). */
export const EXT_FLAG_PATH_TOKENIZED = 1 << 0
export const EXT_FLAG_QUERY_COMPRESSED = 1 << 1
