import { encode as uqrEncode } from 'uqr'
import type { QrEncodeOptions, QrEncodeResult, QrEncoder } from '@/qr/types'

function buildSvgString(matrix: boolean[][], margin: number): string {
  const size = matrix.length
  const total = size + margin * 2
  const cells: string[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) cells.push(`M${x + margin},${y + margin}h1v1h-1z`)
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="#fff"/>` +
    `<path d="${cells.join('')}" fill="#000"/>` +
    `</svg>`
  )
}

async function svgToPngBlob(svg: string, sizePx: number): Promise<Blob> {
  const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('no se pudo rasterizar el SVG'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = sizePx
    canvas.height = sizePx
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no se pudo obtener contexto 2D de canvas')
    ctx.drawImage(image, 0, 0, sizePx, sizePx)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('no se pudo generar el PNG'))
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export const uqrAdapter: QrEncoder = {
  encode(text: string, options: QrEncodeOptions): QrEncodeResult {
    const margin = options.marginModules ?? 4
    const result = uqrEncode(text, { ecc: options.errorCorrectionLevel })
    const matrix = result.data

    return {
      version: result.version,
      moduleCount: result.size,
      errorCorrectionLevel: options.errorCorrectionLevel,
      matrix,
      toSvgString: () => buildSvgString(matrix, margin),
      toPngBlob: (sizePx: number) =>
        svgToPngBlob(buildSvgString(matrix, margin), sizePx),
    }
  },
}
