export function formatBytes(bytes: number): string {
  return `${bytes} B`
}

/** Porcentaje de ahorro entre la longitud original y la del resultado, redondeado. */
export function savingsPct(
  originalLength: number,
  resultLength: number,
): number {
  if (originalLength <= 0) return 0
  return Math.max(0, Math.round((1 - resultLength / originalLength) * 100))
}
