import { describe, expect, it } from 'vitest'
import { fromBase45, toBase45 } from '@/codec/base45'

describe('base45', () => {
  it('round-trips arbitrary byte buffers', () => {
    const cases = [
      new Uint8Array([]),
      new Uint8Array([0]),
      new Uint8Array([255]),
      new Uint8Array([1, 2, 3, 4, 5]),
      new Uint8Array([0, 0, 0, 0]),
      new Uint8Array(Array.from({ length: 97 }, (_, i) => i % 256)),
    ]
    for (const bytes of cases) {
      expect(fromBase45(toBase45(bytes))).toEqual(bytes)
    }
  })

  it('matches the RFC 9285 "AB" example', () => {
    // RFC 9285 §4.3: base45("AB") == "BB8"
    const bytes = new TextEncoder().encode('AB')
    expect(toBase45(bytes)).toBe('BB8')
  })

  it('only produces characters from the QR-safe alphabet', () => {
    const bytes = new Uint8Array(Array.from({ length: 50 }, (_, i) => i * 5))
    expect(toBase45(bytes)).toMatch(/^[0-9A-Z $%*+\-./:]*$/)
  })

  it('rejects invalid characters', () => {
    expect(() => fromBase45('abc')).toThrow()
  })

  it('rejects a length that is 1 mod 3', () => {
    expect(() => fromBase45('BB8B')).toThrow()
  })

  it('rejects an out-of-range triplet', () => {
    expect(() => fromBase45('ZZZ')).toThrow()
  })
})
