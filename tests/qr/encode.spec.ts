import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { uqrAdapter } from '@/qr/adapters/uqrAdapter'
import { encodeToQrPath } from '@/codec/v1/registry'
import { normalizeUrl } from '@/codec/v1/normalize'

/**
 * Rasteriza la matriz de módulos directamente a un buffer RGBA, sin pasar
 * por SVG/canvas (no disponibles de forma fiable en el entorno de test).
 * `jsQR` decodifica el mismo tipo de buffer que produciría un canvas real.
 */
function matrixToImageData(
  matrix: boolean[][],
  margin: number,
  scale: number,
): { data: Uint8ClampedArray; width: number; height: number } {
  const size = matrix.length
  const total = (size + margin * 2) * scale
  const data = new Uint8ClampedArray(total * total * 4)
  data.fill(255) // blanco por defecto

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!matrix[y][x]) continue
      const px0 = (x + margin) * scale
      const py0 = (y + margin) * scale
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = px0 + dx
          const py = py0 + dy
          const offset = (py * total + px) * 4
          data[offset] = 0
          data[offset + 1] = 0
          data[offset + 2] = 0
          data[offset + 3] = 255
        }
      }
    }
  }

  return { data, width: total, height: total }
}

function decodeViaJsQr(matrix: boolean[][]): string | null {
  const { data, width, height } = matrixToImageData(matrix, 4, 4)
  const result = jsQR(data, width, height)
  return result?.data ?? null
}

describe('uqrAdapter + registry (QR round-trip)', () => {
  it('a scanned QR decodes back to the exact QR payload text', () => {
    const normalized = normalizeUrl('https://example.com/a/b?c=1')
    const qrPayload = encodeToQrPath(normalized) // "V1.<base45>"

    const qr = uqrAdapter.encode(qrPayload, { errorCorrectionLevel: 'M' })
    const scanned = decodeViaJsQr(qr.matrix)

    expect(scanned).toBe(qrPayload)
  })

  it('round-trips through the full pipeline: scan -> decode -> same destination', () => {
    const normalized = normalizeUrl('https://github.com/vitejs/vite')
    const qrPayload = encodeToQrPath(normalized)
    const qr = uqrAdapter.encode(qrPayload, { errorCorrectionLevel: 'M' })
    const scanned = decodeViaJsQr(qr.matrix)
    expect(scanned).toBe(qrPayload)
  })

  it('exposes version, module count and SVG output', () => {
    const qr = uqrAdapter.encode('V1.HELLO', { errorCorrectionLevel: 'M' })
    expect(qr.version).toBeGreaterThanOrEqual(1)
    expect(qr.moduleCount).toBe(qr.matrix.length)
    expect(qr.toSvgString()).toContain('<svg')
  })

  it('honors a higher error correction level (bigger/more redundant code)', () => {
    const text = 'V1.HELLOWORLD123'
    const low = uqrAdapter.encode(text, { errorCorrectionLevel: 'L' })
    const high = uqrAdapter.encode(text, { errorCorrectionLevel: 'H' })
    expect(high.version).toBeGreaterThanOrEqual(low.version)
  })
})
