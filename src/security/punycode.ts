/**
 * Decodificador Punycode (RFC 3492) mínimo, sólo lectura. Necesario porque
 * los hosts ya se almacenan en el codec en su forma ASCII (`xn--...`); para
 * detectar homógrafos hay que reconstruir el label Unicode original.
 */
const BASE = 36
const TMIN = 1
const TMAX = 26
const SKEW = 38
const DAMP = 700
const INITIAL_BIAS = 72
const INITIAL_N = 128
const DELIMITER = '-'

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let d = firstTime ? Math.floor(delta / DAMP) : Math.floor(delta / 2)
  d += Math.floor(d / numPoints)
  let k = 0
  while (d > ((BASE - TMIN) * TMAX) >> 1) {
    d = Math.floor(d / (BASE - TMIN))
    k += BASE
  }
  return k + Math.floor(((BASE - TMIN + 1) * d) / (d + SKEW))
}

function basicToDigit(codePoint: number): number {
  if (codePoint >= 48 && codePoint <= 57) return codePoint - 22 // '0'-'9'
  if (codePoint >= 65 && codePoint <= 90) return codePoint - 65 // 'A'-'Z'
  if (codePoint >= 97 && codePoint <= 122) return codePoint - 97 // 'a'-'z'
  return -1
}

/** Decodifica un único label punycode (sin el prefijo `xn--`) a Unicode. */
export function decodePunycodeLabel(input: string): string {
  const output: number[] = []
  let n = INITIAL_N
  let i = 0
  let bias = INITIAL_BIAS

  const lastDelimiter = input.lastIndexOf(DELIMITER)
  const basicLength = lastDelimiter === -1 ? 0 : lastDelimiter
  for (let j = 0; j < basicLength; j++) {
    output.push(input.charCodeAt(j))
  }

  let index = basicLength > 0 ? basicLength + 1 : 0

  while (index < input.length) {
    const oldi = i
    let w = 1
    for (let k = BASE; ; k += BASE) {
      if (index >= input.length) throw new Error('punycode inválido')
      const digit = basicToDigit(input.charCodeAt(index++))
      if (digit === -1) throw new Error('punycode inválido')
      i += digit * w
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
      if (digit < t) break
      w *= BASE - t
    }
    const outLength = output.length + 1
    bias = adapt(i - oldi, outLength, oldi === 0)
    n += Math.floor(i / outLength)
    i %= outLength
    output.splice(i, 0, n)
    i++
  }

  return String.fromCodePoint(...output)
}
