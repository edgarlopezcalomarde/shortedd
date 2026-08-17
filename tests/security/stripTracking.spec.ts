import { describe, expect, it } from 'vitest'
import { normalizeUrl } from '@/codec/v1/normalize'
import { TRACKING_PARAMS } from '@/security/stripTracking'
import fixtures from '../fixtures/urls.json'

describe('stripTracking (via normalizeUrl, siempre activo)', () => {
  it('elimina utm_* pero conserva otros parámetros', () => {
    const fixture = fixtures.valid.find((f) => f.id === 'tracking-params')!
    const normalized = normalizeUrl(fixture.input)
    expect(normalized).not.toContain('utm_source')
    expect(normalized).not.toContain('utm_medium')
    expect(normalized).not.toContain('utm_campaign')
    expect(normalized).toContain('ref=abc')
  })

  it('elimina fbclid pero conserva id', () => {
    const fixture = fixtures.valid.find((f) => f.id === 'fbclid')!
    const normalized = normalizeUrl(fixture.input)
    expect(normalized).not.toContain('fbclid')
    expect(normalized).toContain('id=99')
  })

  it('elimina gclid y utm_source juntos', () => {
    const fixture = fixtures.valid.find((f) => f.id === 'gclid')!
    const normalized = normalizeUrl(fixture.input)
    expect(normalized).not.toContain('gclid')
    expect(normalized).not.toContain('utm_source')
  })

  it('nunca deja sobrevivir ningún parámetro de la lista de tracking, en ningún fixture', () => {
    for (const fixture of fixtures.valid) {
      const normalized = normalizeUrl(fixture.input)
      const params = new URL(normalized).searchParams
      for (const trackingKey of TRACKING_PARAMS) {
        expect(params.has(trackingKey)).toBe(false)
      }
    }
  })

  it('no elimina query params legítimos que no están en la lista', () => {
    const normalized = normalizeUrl('https://example.com/search?q=hello&page=2')
    expect(normalized).toContain('q=hello')
    expect(normalized).toContain('page=2')
  })
})
