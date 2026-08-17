import { useCallback, useState } from 'react'

export function useClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), resetAfterMs)
    },
    [resetAfterMs],
  )

  return { copied, copy }
}
