export type EccLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrEncodeOptions {
  errorCorrectionLevel: EccLevel
  /** Ancho de la zona de silencio, en módulos. Por defecto 4. */
  marginModules?: number
}

export interface QrEncodeResult {
  version: number
  moduleCount: number
  errorCorrectionLevel: EccLevel
  /** Matriz de módulos, `true` = módulo oscuro. Agnóstica de librería. */
  matrix: boolean[][]
  toSvgString(): string
  toPngBlob(sizePx: number): Promise<Blob>
}

export interface QrEncoder {
  encode(text: string, options: QrEncodeOptions): QrEncodeResult
}
