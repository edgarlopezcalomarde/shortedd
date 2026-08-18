import { Check, Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClipboard } from '@/app/hooks/useClipboard'
import { useReducedMotion } from '@/app/hooks/useReducedMotion'
import { savingsPct } from '@/app/lib/formatBytes'
import type { GenerationResult } from '@/app/lib/generate'
import { cn } from '@/lib/utils'

interface ResultPanelProps {
  result: GenerationResult
}

export function ResultPanel({ result }: ResultPanelProps) {
  const { copied, copy } = useClipboard()
  const reducedMotion = useReducedMotion()
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator
  const savings = savingsPct(
    result.normalizedUrl.length,
    result.webLink.length,
  )

  return (
    <section
      className={cn(
        'border-border mt-4 flex flex-col gap-2 border-t pt-4',
        !reducedMotion &&
          'animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out',
      )}
    >
      <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate font-mono text-sm tracking-tight">
          {result.webLink}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => copy(result.webLink)}
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
        {canShare && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              navigator.share({ url: result.webLink }).catch(() => {})
            }
          >
            <Share2 className="size-3.5" />
            Compartir
          </Button>
        )}
      </div>
      <p className="text-muted-foreground pl-0.5 font-mono text-xs">
        {savings > 0
          ? `${savings}% más corto que la URL original`
          : 'Enlace generado'}
      </p>
    </section>
  )
}
