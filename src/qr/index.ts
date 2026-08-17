export type {
  EccLevel,
  QrEncodeOptions,
  QrEncodeResult,
  QrEncoder,
} from '@/qr/types'

/**
 * Carga el adaptador QR (y su dependencia `uqr`) sólo cuando el usuario lo
 * necesita, vía `import()` dinámico, para no tocar el bundle inicial.
 * Cambiar de librería QR es un cambio de un solo archivo (`adapters/*`).
 */
export async function getQrEncoder() {
  const { uqrAdapter } = await import('@/qr/adapters/uqrAdapter')
  return uqrAdapter
}
