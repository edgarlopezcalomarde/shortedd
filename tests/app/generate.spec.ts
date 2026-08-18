import { describe, expect, it } from 'vitest'
import { generateLinks } from '@/app/lib/generate'
import { normalizeUrl } from '@/codec/v1/normalize'
import { decodeWebPayload } from '@/codec/v1/registry'

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

  it('builds a correct web link under a project-page base path', () => {
    const normalized = normalizeUrl('https://example.com/a')
    const result = generateLinks(
      normalized,
      'https://user.github.io',
      '/shortedd/',
    )
    expect(result.webLink).toMatch(
      /^https:\/\/user\.github\.io\/shortedd\/#v1\./,
    )
    expect(decodeWebPayload(result.webLink.split('#')[1])).toEqual({
      ok: true,
      url: normalized,
    })
  })
})
