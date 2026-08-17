/**
 * 2048 es el techo histórico usado como denominador común seguro en
 * navegadores/proxies/CDNs (heredado del límite de ~2083 de IE).
 */
export const MAX_INPUT_URL_LENGTH = 2048

/** Techo sobre el string de payload entrante, antes de intentar decodificar nada. */
export const MAX_PAYLOAD_STRING_LENGTH = 4000

/** Bytes del blob binario codificado, antes de base64url. */
export const MAX_WEB_PAYLOAD_BYTES = 1500

/**
 * Bytes del blob binario codificado, antes de base45. Mantiene el QR en
 * versión <=10 con ECC M/Q, rango fiable para cámaras de móvil.
 */
export const MAX_QR_PAYLOAD_BYTES = 90
