/** CRC32 (IEEE 802.3, polinomio 0xEDB88320) para detectar corrupción accidental del payload. */
const TABLE = buildTable()

function buildTable(): Uint32Array {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
}

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/** Escribe el CRC32 de `payload` como 4 bytes big-endian al final del buffer devuelto. */
export function appendChecksum(payload: Uint8Array): Uint8Array {
  const checksum = crc32(payload)
  const result = new Uint8Array(payload.length + 4)
  result.set(payload, 0)
  result[payload.length] = (checksum >>> 24) & 0xff
  result[payload.length + 1] = (checksum >>> 16) & 0xff
  result[payload.length + 2] = (checksum >>> 8) & 0xff
  result[payload.length + 3] = checksum & 0xff
  return result
}

/**
 * Separa los últimos 4 bytes como checksum y valida contra el resto del buffer.
 * Lanza si el buffer es demasiado corto o el checksum no coincide (corrupción).
 */
export function splitAndVerifyChecksum(buffer: Uint8Array): Uint8Array {
  if (buffer.length < 4) {
    throw new Error('payload demasiado corto para contener un checksum')
  }
  const payload = buffer.subarray(0, buffer.length - 4)
  const expected =
    ((buffer[buffer.length - 4] << 24) |
      (buffer[buffer.length - 3] << 16) |
      (buffer[buffer.length - 2] << 8) |
      buffer[buffer.length - 1]) >>>
    0
  const actual = crc32(payload)
  if (actual !== expected) {
    throw new Error('checksum inválido: el payload está corrupto')
  }
  return payload
}
