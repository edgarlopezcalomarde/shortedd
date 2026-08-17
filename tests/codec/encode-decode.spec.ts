import { describe, expect, it } from 'vitest'
import { decodeUrl } from '@/codec/v1/decode'
import { encodeUrl } from '@/codec/v1/encode'
import { normalizeUrl } from '@/codec/v1/normalize'
import fixtures from '../fixtures/urls.json'

describe('encodeUrl / decodeUrl round-trip', () => {
  it.each(fixtures.valid)(
    'preserves the normalized URL for fixture "$id"',
    ({ input }) => {
      const normalized = normalizeUrl(input)
      const bytes = encodeUrl(normalized)
      expect(decodeUrl(bytes)).toBe(normalized)
    },
  )

  it('uses the dictionary for a known host (payload shrinks)', () => {
    const normalized = normalizeUrl('https://github.com/vitejs/vite')
    const bytes = encodeUrl(normalized)
    const literalHostBytes = encodeUrl(
      normalizeUrl('https://not-in-dictionary-example.org/vitejs/vite'),
    )
    expect(bytes.length).toBeLessThan(literalHostBytes.length)
  })

  it('detects corruption via checksum before attempting to parse fields', () => {
    const bytes = encodeUrl(normalizeUrl('https://example.com/path'))
    const corrupted = bytes.slice()
    corrupted[1] ^= 0xff
    expect(() => decodeUrl(corrupted)).toThrow()
  })

  it('round-trips a URL with port, path, query and fragment', () => {
    const normalized = normalizeUrl(
      'https://example.com:8443/a/b/c?x=1&y=2#section',
    )
    expect(decodeUrl(encodeUrl(normalized))).toBe(normalized)
  })

  it('round-trips http (non-default) scheme', () => {
    const normalized = normalizeUrl('http://example.com/insecure')
    expect(normalized.startsWith('http://')).toBe(true)
    expect(decodeUrl(encodeUrl(normalized))).toBe(normalized)
  })
})
