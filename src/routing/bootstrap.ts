import { decodeQrPayload, decodeWebPayload } from '@/codec/v1/registry'
import type { DetectedPayload } from '@/routing/detectPayload'
import { detectPayloadFromWindow } from '@/routing/detectPayload'
import { checkConfusableHostname } from '@/security/confusables'

export type BootstrapDecision =
  | { action: 'mount' }
  | { action: 'redirect'; url: string }
  | { action: 'confirm'; url: string; reason: string }
  | { action: 'error'; reason: string }

/**
 * Decide qué hacer antes de montar la UI: redirigir al instante (sin
 * pantalla de previsualización) en el caso general, mostrar un error
 * (payload inválido/corrupto/versión desconocida/bucle de redirección —
 * nunca redirige), o montar la app generadora normal.
 *
 * Única excepción a "sin preview": si el hostname destino activa la
 * heurística de dominio confuso/homógrafo, se devuelve `confirm` en vez de
 * `redirect` para mostrar un aviso breve antes de navegar. Función pura: no
 * realiza el `location.replace()` en sí, ver `runBootstrap`.
 */
export function decideBootstrap(
  payload: DetectedPayload | null,
  currentOrigin: string,
): BootstrapDecision {
  if (!payload) return { action: 'mount' }

  const result =
    payload.kind === 'web'
      ? decodeWebPayload(payload.raw)
      : decodeQrPayload(payload.raw)

  if (!result.ok) return { action: 'error', reason: result.reason }

  // Un enlace Shortedd que apunta de vuelta al propio origen de Shortedd no
  // sirve para nada y arriesga una cadena/bucle de redirección si se
  // encadenan varios; se rechaza en vez de redirigir.
  if (new URL(result.url).origin === currentOrigin) {
    return {
      action: 'error',
      reason:
        'este enlace redirige de vuelta a Shortedd, no a un destino externo',
    }
  }

  const hostname = new URL(result.url).hostname
  const confusable = checkConfusableHostname(hostname)
  if (confusable.suspicious) {
    return { action: 'confirm', url: result.url, reason: confusable.reason! }
  }

  return { action: 'redirect', url: result.url }
}

/**
 * Punto de entrada real: lee la ubicación actual, decide, y ejecuta el
 * efecto correspondiente. `location.replace()` sólo se llama tras validar
 * por completo el payload y, salvo la excepción de dominio confuso, sin
 * pantalla intermedia.
 */
export function runBootstrap(): BootstrapDecision {
  const decision = decideBootstrap(
    detectPayloadFromWindow(),
    window.location.origin,
  )
  if (decision.action === 'redirect') {
    window.location.replace(decision.url)
  }
  return decision
}
