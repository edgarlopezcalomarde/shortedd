import { describe, expect, it } from 'vitest'
import { appendChecksum, crc32, splitAndVerifyChecksum } from '@/codec/checksum'

describe('crc32', () => {
  it('matches the well-known CRC32("123456789") test vector', () => {
    const bytes = new TextEncoder().encode('123456789')
    expect(crc32(bytes)).toBe(0xcbf43926)
  })

  it('appendChecksum + splitAndVerifyChecksum round-trips', () => {
    const payload = new TextEncoder().encode('hello shortedd')
    const withChecksum = appendChecksum(payload)
    expect(withChecksum.length).toBe(payload.length + 4)
    expect(splitAndVerifyChecksum(withChecksum)).toEqual(payload)
  })

  it('detects a single flipped byte as corruption', () => {
    const payload = new TextEncoder().encode('hello shortedd')
    const withChecksum = appendChecksum(payload)
    const corrupted = withChecksum.slice()
    corrupted[0] ^= 0xff
    expect(() => splitAndVerifyChecksum(corrupted)).toThrow()
  })

  it('rejects a buffer too short to contain a checksum', () => {
    expect(() => splitAndVerifyChecksum(new Uint8Array([1, 2, 3]))).toThrow()
  })
})
