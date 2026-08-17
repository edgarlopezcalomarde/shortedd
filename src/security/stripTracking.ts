/**
 * Parámetros de tracking eliminados incondicionalmente al normalizar. Sin
 * toggle ni preferencia persistida: se eliminan siempre, sin excepción.
 */
export const TRACKING_PARAMS: readonly string[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'gclsrc',
  'dclid',
  'fbclid',
  'fb_action_ids',
  'fb_action_types',
  'fb_source',
  'mc_cid',
  'mc_eid',
  'igshid',
  'ref_src',
  'yclid',
  'msclkid',
  'twclid',
  'vero_id',
  '_hsenc',
  '_hsmi',
  'mkt_tok',
]

const TRACKING_PARAM_SET = new Set(TRACKING_PARAMS)

/**
 * Elimina los parámetros de tracking conocidos de `url` in-place. Devuelve
 * cuántos se eliminaron (para una notificación no bloqueante en la UI).
 */
export function stripTrackingParams(url: URL): number {
  const keysToDelete = [...url.searchParams.keys()].filter((key) =>
    TRACKING_PARAM_SET.has(key),
  )
  const uniqueKeys = [...new Set(keysToDelete)]
  for (const key of uniqueKeys) url.searchParams.delete(key)
  return uniqueKeys.length
}
