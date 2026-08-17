import { decodePunycodeLabel } from '@/security/punycode'

/**
 * Heurística ligera de homógrafos: en vez de una tabla completa de
 * confusables Unicode (~6000 mapeos), detecta el patrón clásico de
 * suplantación — un label que mezcla Latín con otro alfabeto visualmente
 * similar (Cirílico, Griego) — usando escapes de propiedad Unicode
 * nativos, sin dependencias.
 */
const SUSPICIOUS_SCRIPTS: { name: string; pattern: RegExp }[] = [
  { name: 'latín', pattern: /\p{Script=Latin}/u },
  { name: 'cirílico', pattern: /\p{Script=Cyrillic}/u },
  { name: 'griego', pattern: /\p{Script=Greek}/u },
]

function toUnicodeLabel(label: string): string {
  if (!label.startsWith('xn--')) return label
  try {
    return decodePunycodeLabel(label.slice(4))
  } catch {
    return label
  }
}

export interface ConfusableCheck {
  suspicious: boolean
  reason?: string
}

/**
 * Comprueba si `hostname` (forma ASCII/punycode, tal como se decodifica del
 * codec) mezcla varios alfabetos dentro del mismo label — el patrón típico
 * de un dominio homógrafo (p. ej. Cirílico "а" en "аpple.com").
 */
export function checkConfusableHostname(hostname: string): ConfusableCheck {
  for (const rawLabel of hostname.split('.')) {
    const label = toUnicodeLabel(rawLabel)
    const scriptsPresent = SUSPICIOUS_SCRIPTS.filter((s) =>
      s.pattern.test(label),
    )
    if (scriptsPresent.length > 1) {
      return {
        suspicious: true,
        reason: `El dominio mezcla varios alfabetos (${scriptsPresent
          .map((s) => s.name)
          .join(', ')}), un patrón habitual de dominios falsos.`,
      }
    }
  }
  return { suspicious: false }
}
