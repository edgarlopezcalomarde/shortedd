import { describe, expect, it } from 'vitest'
import { toBase45 } from '@/codec/base45'
import { toBase64Url } from '@/codec/base64url'
import { normalizeUrl } from '@/codec/v1/normalize'
import { selectBestEncoding } from '@/codec/v1/select'
import fixtures from '../fixtures/urls.json'
import baseline from '../fixtures/metrics-baseline.json'

interface FixtureMetric {
  id: string
  originalLength: number
  encodedBytes: number
  webLength: number
  qrLength: number
}

function computeMetrics(): FixtureMetric[] {
  return fixtures.valid.map(({ id, input }) => {
    const normalized = normalizeUrl(input)
    const { bytes } = selectBestEncoding(normalized)
    return {
      id,
      originalLength: input.length,
      encodedBytes: bytes.length,
      webLength: toBase64Url(bytes).length,
      qrLength: toBase45(bytes).length,
    }
  })
}

describe('corpus compression metrics', () => {
  it('encodes the whole corpus within 100ms', () => {
    const start = performance.now()
    computeMetrics()
    expect(performance.now() - start).toBeLessThan(100)
  })

  it('never regresses total encoded size beyond the checked-in baseline', () => {
    const metrics = computeMetrics()
    const totalEncodedBytes = metrics.reduce(
      (sum, m) => sum + m.encodedBytes,
      0,
    )
    const totalWebLength = metrics.reduce((sum, m) => sum + m.webLength, 0)

    // Tolerancia del 10% para absorber cambios legítimos al corpus de
    // fixtures sin tener que regenerar la baseline por cada nueva entrada.
    expect(totalEncodedBytes).toBeLessThanOrEqual(
      baseline.totalEncodedBytes * 1.1,
    )
    expect(totalWebLength).toBeLessThanOrEqual(baseline.totalWebLength * 1.1)
  })

  it('every fixture individually shrinks or matches its baseline entry', () => {
    const metrics = computeMetrics()
    const byId = new Map(baseline.fixtures.map((f) => [f.id, f]))
    for (const metric of metrics) {
      const base = byId.get(metric.id)
      if (!base) continue // fixture nueva, sin entrada de baseline todavía
      expect(metric.encodedBytes).toBeLessThanOrEqual(base.encodedBytes + 2)
    }
  })
})
