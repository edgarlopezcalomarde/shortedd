import { describe, expect, it } from 'vitest'
import {
  decodeQrPayload,
  decodeWebPayload,
  encodeToQrPath,
  encodeToWebFragment,
} from '@/codec/v1/registry'
import { normalizeUrl } from '@/codec/v1/normalize'

describe('registry', () => {
  it('web and QR fragments derived from the same URL decode to the same destination', () => {
    const normalized = normalizeUrl('https://example.com/a/b?c=1')
    const webPayload = encodeToWebFragment(normalized)
    const qrPayload = encodeToQrPath(normalized)

    expect(webPayload.startsWith('v1.')).toBe(true)
    expect(qrPayload.startsWith('V1.')).toBe(true)

    const webResult = decodeWebPayload(webPayload)
    const qrResult = decodeQrPayload(qrPayload)

    expect(webResult).toEqual({ ok: true, url: normalized })
    expect(qrResult).toEqual({ ok: true, url: normalized })
  })

  it('rejects an unknown version prefix without redirecting', () => {
    const result = decodeWebPayload('v99.deadbeef')
    expect(result.ok).toBe(false)
  })

  it('rejects a payload with no version separator', () => {
    const result = decodeWebPayload('nodotshere')
    expect(result.ok).toBe(false)
  })

  it('rejects an empty payload', () => {
    expect(decodeWebPayload('').ok).toBe(false)
  })

  it('rejects a payload whose flags byte was flipped (checksum mismatch)', () => {
    const normalized = normalizeUrl('https://example.com/x')
    const payload = encodeToWebFragment(normalized)
    const body = payload.slice('v1.'.length)
    // El primer carácter base64url codifica (entre otros) el byte de flags;
    // sustituirlo por un carácter distinto del alfabeto altera los bytes
    // decodificados sin cambiar la longitud, así que el checksum lo atrapa.
    const replacement = body[0] === 'A' ? 'Z' : 'A'
    const corrupted = `v1.${replacement}${body.slice(1)}`
    expect(decodeWebPayload(corrupted).ok).toBe(false)
  })

  it('a QR payload is never accepted by the web decoder and vice versa', () => {
    const normalized = normalizeUrl('https://example.com/mixed')
    const qrPayload = encodeToQrPath(normalized)
    expect(decodeWebPayload(qrPayload).ok).toBe(false)
  })
})
