/**
 * Diccionario de hosts congelado para el codec v1. NUNCA mutar esta lista
 * tras publicar v1: los payloads existentes referencian estas entradas por
 * índice posicional. Ampliar la cobertura requiere un codec v2 con su propio
 * `dictionary-v2.ts`, no editar este archivo.
 *
 * Metodología: partir de dominios de alto tráfico (p. ej. listas públicas
 * tipo Tranco/Chrome UX Report) y quedarse sólo con los relevantes para
 * compartir enlaces (dev, social, cloud/oficina, comercio, media),
 * descartando ruido publicitario/CDN. Tope de 256 entradas: cabe en 1 byte.
 */
export const HOST_DICTIONARY_V1: readonly string[] = [
  // Dev / código
  'github.com',
  'gitlab.com',
  'bitbucket.org',
  'stackoverflow.com',
  'npmjs.com',
  'vercel.app',
  'netlify.app',
  'pypi.org',
  'readthedocs.io',
  'docs.google.com',
  'developer.mozilla.org',
  'codepen.io',
  'codesandbox.io',
  'replit.com',
  // Social / media
  'youtube.com',
  'youtu.be',
  'twitter.com',
  'x.com',
  'instagram.com',
  'facebook.com',
  'linkedin.com',
  'reddit.com',
  'tiktok.com',
  'pinterest.com',
  't.me',
  'discord.com',
  'discord.gg',
  'twitch.tv',
  'medium.com',
  'dev.to',
  'threads.net',
  'mastodon.social',
  'bsky.app',
  // Search / cloud / oficina
  'google.com',
  'drive.google.com',
  'docs.microsoft.com',
  'notion.so',
  'dropbox.com',
  'slack.com',
  'zoom.us',
  'wikipedia.org',
  'calendar.google.com',
  'maps.google.com',
  'office.com',
  'onedrive.live.com',
  // Comercio
  'amazon.com',
  'ebay.com',
  'etsy.com',
  'shopify.com',
  'paypal.com',
  'stripe.com',
  'mercadolibre.com',
  // Infra / plataformas
  'apple.com',
  'microsoft.com',
  'openai.com',
  'chatgpt.com',
  'anthropic.com',
  'claude.ai',
  'cloudflare.com',
  'spotify.com',
  'netflix.com',
  'imgur.com',
  'wordpress.com',
  'blogspot.com',
] as const

const HOST_TO_INDEX = new Map<string, number>(
  HOST_DICTIONARY_V1.map((host, index) => [host, index]),
)

export function lookupHostIndex(host: string): number | null {
  const index = HOST_TO_INDEX.get(host)
  return index === undefined ? null : index
}

export function lookupHostByIndex(index: number): string {
  const host = HOST_DICTIONARY_V1[index]
  if (host === undefined) {
    throw new Error(`índice de diccionario de host fuera de rango: ${index}`)
  }
  return host
}

/**
 * Tokens de segmentos de path frecuentes. Mismo tope de 256 y misma regla de
 * congelación que `HOST_DICTIONARY_V1`. Índice separado del de hosts.
 */
export const PATH_TOKENS_V1: readonly string[] = [
  'watch',
  'video',
  'videos',
  'user',
  'users',
  'product',
  'products',
  'item',
  'items',
  'post',
  'posts',
  'article',
  'articles',
  'search',
  'status',
  'share',
  'channel',
  'playlist',
  'list',
  'profile',
  'page',
  'pages',
  'id',
  'docs',
  'doc',
  'blog',
  'api',
  'v1',
  'v2',
  'app',
  'apps',
  'download',
  'downloads',
  'category',
  'categories',
  'tag',
  'tags',
  'en',
  'es',
  'en-us',
  'fr',
  'de',
] as const

const PATH_TOKEN_TO_INDEX = new Map<string, number>(
  PATH_TOKENS_V1.map((token, index) => [token, index]),
)

export function lookupPathTokenIndex(segment: string): number | null {
  const index = PATH_TOKEN_TO_INDEX.get(segment)
  return index === undefined ? null : index
}

export function lookupPathTokenByIndex(index: number): string {
  const token = PATH_TOKENS_V1[index]
  if (token === undefined) {
    throw new Error(`índice de token de path fuera de rango: ${index}`)
  }
  return token
}

/**
 * Nombres de parámetros de query frecuentes (sólo la clave; el valor nunca
 * se tokeniza). Mismo tope/regla de congelación, índice separado.
 */
export const QUERY_PARAM_TOKENS_V1: readonly string[] = [
  'q',
  'id',
  'v',
  't',
  's',
  'p',
  'page',
  'lang',
  'ref',
  'tag',
  'sort',
  'filter',
  'category',
  'type',
  'view',
  'mode',
] as const

const QUERY_PARAM_TOKEN_TO_INDEX = new Map<string, number>(
  QUERY_PARAM_TOKENS_V1.map((token, index) => [token, index]),
)

export function lookupQueryParamTokenIndex(key: string): number | null {
  const index = QUERY_PARAM_TOKEN_TO_INDEX.get(key)
  return index === undefined ? null : index
}

export function lookupQueryParamTokenByIndex(index: number): string {
  const token = QUERY_PARAM_TOKENS_V1[index]
  if (token === undefined) {
    throw new Error(`índice de token de query fuera de rango: ${index}`)
  }
  return token
}
