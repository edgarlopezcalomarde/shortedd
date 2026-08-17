import { describe, expect, it } from 'vitest'
import { generateLinks } from '@/app/lib/generate'
import { normalizeUrl } from '@/codec/v1/normalize'
import { decodeQrPayload, decodeWebPayload } from '@/codec/v1/registry'

describe('generateLinks', () => {
  it('builds a correct web link at the root base path', () => {
    const normalized = normalizeUrl('https://example.com/a')
    const result = generateLinks(normalized, 'https://short.example', '/')
    expect(result.webLink).toMatch(/^https:\/\/short\.example\/#v1\./)
    expect(decodeWebPayload(result.webLink.split('#')[1])).toEqual({
      ok: true,
      url: normalized,
    })
  })

  it('builds a correct QR link under a project-page base path', () => {
    const normalized = normalizeUrl('https://example.com/a')
    const result = generateLinks(
      normalized,
      'https://user.github.io',
      '/shortedd/',
    )
    expect(result.webLink).toMatch(
      /^https:\/\/user\.github\.io\/shortedd\/#v1\./,
    )
    expect(result.qr.available).toBe(true)
    if (result.qr.available) {
      expect(result.qr.link).toMatch(
        /^https:\/\/user\.github\.io\/shortedd\/q\/V1\./,
      )
      const raw = result.qr.link.split('/shortedd/q/')[1]
      expect(decodeQrPayload(raw)).toEqual({ ok: true, url: normalized })
    }
  })

  it('disables QR (never a broken link) when the payload exceeds the QR byte budget', () => {
    const hugePath = '/'.concat('x'.repeat(300))
    const normalized = normalizeUrl(`https://example.com${hugePath}`)
    const result = generateLinks(normalized, 'https://short.example', '/')
    expect(result.qr.available).toBe(false)
    // El enlace web sigue disponible igualmente.
    expect(result.webLink).toContain('#v1.')
  })
})
