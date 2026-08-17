/**
 * RFC 9285 Base45. El alfabeto de 45 caracteres coincide exactamente con el
 * "alphanumeric mode" de QR (0-9 A-Z $%*+-./:), lo que permite que el
 * generador QR empaquete el texto a ~5.5 bits/carácter en vez de 8 bits/carácter
 * (byte mode). Usado por el enlace QR `/q/V1.<payload>`.
 */
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'

const CHAR_TO_VALUE = new Map<string, number>(
  [...ALPHABET].map((char, index) => [char, index]),
)

export function toBase45(bytes: Uint8Array): string {
  let result = ''
  let i = 0
  for (; i + 1 < bytes.length; i += 2) {
    let n = bytes[i] * 256 + bytes[i + 1]
    const c = n % 45
    n = (n - c) / 45
    const d = n % 45
    const e = (n - d) / 45
    result += ALPHABET[c] + ALPHABET[d] + ALPHABET[e]
  }
  if (i < bytes.length) {
    const n = bytes[i]
    const c = n % 45
    const d = (n - c) / 45
    result += ALPHABET[c] + ALPHABET[d]
  }
  return result
}

export function fromBase45(text: string): Uint8Array {
  const values: number[] = new Array(text.length)
  for (let i = 0; i < text.length; i++) {
    const value = CHAR_TO_VALUE.get(text[i])
    if (value === undefined) {
      throw new Error(
        `base45 inválido: carácter fuera de alfabeto "${text[i]}"`,
      )
    }
    values[i] = value
  }

  const remainder = values.length % 3
  if (remainder === 1) {
    throw new Error('base45 inválido: longitud incorrecta')
  }

  const bytes: number[] = []
  let i = 0
  for (; i + 2 < values.length; i += 3) {
    const n = values[i] + values[i + 1] * 45 + values[i + 2] * 45 * 45
    if (n > 0xffff) {
      throw new Error('base45 inválido: valor de tripleta fuera de rango')
    }
    bytes.push(Math.floor(n / 256), n % 256)
  }
  if (remainder === 2) {
    const n = values[i] + values[i + 1] * 45
    if (n > 0xff) {
      throw new Error('base45 inválido: valor de par fuera de rango')
    }
    bytes.push(n)
  }
  return new Uint8Array(bytes)
}
