import { describe, expect, it } from 'vitest'
import { decodeUrl } from '@/codec/v1/decode'
import { encodeUrl } from '@/codec/v1/encode'
import { normalizeUrl } from '@/codec/v1/normalize'
import { selectBestEncoding } from '@/codec/v1/select'
import fixtures from '../fixtures/urls.json'

describe('selectBestEncoding', () => {
  it.each(fixtures.valid)(
    'round-trips exactly for fixture "$id"',
    ({ input }) => {
      const normalized = normalizeUrl(input)
      const { bytes } = selectBestEncoding(normalized)
      expect(decodeUrl(bytes)).toBe(normalized)
    },
  )

  it('never picks a candidate longer than the plain literal baseline', () => {
    for (const { input } of fixtures.valid) {
      const normalized = normalizeUrl(input)
      const literalBytes = encodeUrl(normalized)
      const { bytes } = selectBestEncoding(normalized)
      expect(bytes.length).toBeLessThanOrEqual(literalBytes.length)
    }
  })

  it('picks path tokenization for a path made of dictionary tokens', () => {
    const normalized = normalizeUrl('https://example.com/product/id/page')
    const literal = encodeUrl(normalized)
    const { bytes, pathStrategy } = selectBestEncoding(normalized)
    expect(pathStrategy).toBe('tokenized')
    expect(bytes.length).toBeLessThan(literal.length)
  })

  it('picks query compression for known short param names', () => {
    const normalized = normalizeUrl('https://example.com/?q=hi&page=2&sort=asc')
    const literal = encodeUrl(normalized)
    const { bytes, queryStrategy } = selectBestEncoding(normalized)
    expect(queryStrategy).toBe('compressed')
    expect(bytes.length).toBeLessThan(literal.length)
  })

  it('falls back to literal when tokenization would not help', () => {
    const normalized = normalizeUrl(
      'https://example.com/xk7f-unusual-segment-name',
    )
    const { pathStrategy } = selectBestEncoding(normalized)
    expect(pathStrategy).toBe('literal')
  })
})
