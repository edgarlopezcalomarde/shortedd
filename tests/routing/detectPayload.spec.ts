import { describe, expect, it } from 'vitest'
import { detectPayload } from '@/routing/detectPayload'

describe('detectPayload', () => {
  it('detects a web payload from the hash', () => {
    expect(detectPayload({ hash: '#v1.abc123', pathname: '/' }, '/')).toEqual({
      kind: 'web',
      raw: 'v1.abc123',
    })
  })

  it('detects a QR payload from the pathname at root base', () => {
    expect(detectPayload({ hash: '', pathname: '/q/V1.ABC123' }, '/')).toEqual({
      kind: 'qr',
      raw: 'V1.ABC123',
    })
  })

  it('strips a project-page base path before matching /q/', () => {
    expect(
      detectPayload(
        { hash: '', pathname: '/shortedd/q/V1.ABC123' },
        '/shortedd/',
      ),
    ).toEqual({ kind: 'qr', raw: 'V1.ABC123' })
  })

  it('returns null when there is no payload', () => {
    expect(detectPayload({ hash: '', pathname: '/' }, '/')).toBeNull()
  })

  it('prefers the hash over the pathname when both are present', () => {
    expect(
      detectPayload({ hash: '#v1.xyz', pathname: '/q/V1.ABC' }, '/'),
    ).toEqual({ kind: 'web', raw: 'v1.xyz' })
  })

  it('ignores an empty hash ("#")', () => {
    expect(detectPayload({ hash: '#', pathname: '/' }, '/')).toBeNull()
  })
})
