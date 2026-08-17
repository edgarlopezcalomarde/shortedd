import { describe, expect, it } from 'vitest'
import { normalizeUrl } from '@/codec/v1/normalize'
import { MAX_INPUT_URL_LENGTH } from '@/security/limits'
import fixtures from '../fixtures/urls.json'

describe('normalizeUrl', () => {
  it.each(fixtures.valid)('accepts valid fixture "$id"', ({ input }) => {
    expect(() => normalizeUrl(input)).not.toThrow()
  })

  it.each(fixtures.invalid)('rejects invalid fixture "$id"', ({ input }) => {
    expect(() => normalizeUrl(input)).toThrow()
  })

  it('trims accidental surrounding whitespace', () => {
    expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com/')
  })

  it('normalizes a Unicode hostname to punycode', () => {
    expect(normalizeUrl('https://münchen.de/wetter')).toContain('xn--')
  })

  it('rejects dangerous schemes even with unusual casing', () => {
    expect(() => normalizeUrl('JavaScript:alert(1)')).toThrow()
  })

  it('accepts a URL exactly at MAX_INPUT_URL_LENGTH', () => {
    const padLength = MAX_INPUT_URL_LENGTH - 'https://example.com/?p='.length
    const input = `https://example.com/?p=${'a'.repeat(padLength)}`
    expect(input.length).toBe(MAX_INPUT_URL_LENGTH)
    expect(() => normalizeUrl(input)).not.toThrow()
  })

  it('rejects a URL one character over MAX_INPUT_URL_LENGTH', () => {
    const padLength =
      MAX_INPUT_URL_LENGTH - 'https://example.com/?p='.length + 1
    const input = `https://example.com/?p=${'a'.repeat(padLength)}`
    expect(input.length).toBe(MAX_INPUT_URL_LENGTH + 1)
    expect(() => normalizeUrl(input)).toThrow()
  })
})
