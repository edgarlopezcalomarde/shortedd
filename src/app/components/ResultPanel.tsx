import { Check, Copy, Download, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { QrDetails } from '@/app/components/QrDetails'
import { QrOptionsSheet } from '@/app/components/QrOptionsSheet'
import { useClipboard } from '@/app/hooks/useClipboard'
import type { QrPreferences } from '@/app/hooks/useLocalPreferences'
import { savingsPct } from '@/app/lib/formatBytes'
import type { GenerationResult } from '@/app/lib/generate'
import { getQrEncoder } from '@/qr'
import type { QrEncodeResult } from '@/qr/types'

const PNG_DOWNLOAD_SIZE_PX = 512

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

interface CopyShareRowProps {
  link: string
}

function CopyShareRow({ link }: CopyShareRowProps) {
  const { copied, copy } = useClipboard()
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="bg-muted flex-1 truncate rounded-md border px-3 py-2 font-mono text-sm">
        {link}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => copy(link)}
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
          onClick={() => navigator.share({ url: link }).catch(() => {})}
        >
          <Share2 className="size-3.5" />
          Compartir
        </Button>
      )}
    </div>
  )
}

interface ResultPanelProps {
  result: GenerationResult
  preferences: QrPreferences
  onPreferencesChange: (patch: Partial<QrPreferences>) => void
}

export function ResultPanel({
  result,
  preferences,
  onPreferencesChange,
}: ResultPanelProps) {
  const [qr, setQr] = useState<QrEncodeResult | null>(null)

  useEffect(() => {
    if (!result.qr.available) return
    const payload = result.qr.payload
    let cancelled = false
    getQrEncoder().then((encoder) => {
      if (cancelled) return
      setQr(
        encoder.encode(payload, {
          errorCorrectionLevel: preferences.errorCorrectionLevel,
          marginModules: preferences.marginModules,
        }),
      )
    })
    return () => {
      cancelled = true
    }
  }, [result.qr, preferences.errorCorrectionLevel, preferences.marginModules])

  const savings = savingsPct(result.normalizedUrl.length, result.webLink.length)

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Tabs defaultValue="web">
          <div className="flex items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="web">Web</TabsTrigger>
              {result.qr.available ? (
                <TabsTrigger value="qr">QR</TabsTrigger>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <TabsTrigger value="qr" disabled>
                        QR
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{result.qr.reason}</TooltipContent>
                </Tooltip>
              )}
            </TabsList>
            {result.qr.available && (
              <QrOptionsSheet
                preferences={preferences}
                onChange={onPreferencesChange}
              />
            )}
          </div>

          <TabsContent value="web" className="flex flex-col gap-2">
            <CopyShareRow link={result.webLink} />
            <p className="text-muted-foreground text-xs">
              {savings > 0
                ? `${savings}% más corto que la URL original`
                : 'Enlace generado'}
            </p>
          </TabsContent>

          {result.qr.available && (
            <TabsContent value="qr" className="flex flex-col gap-3">
              <CopyShareRow link={result.qr.link} />
              <div className="flex flex-col items-center gap-2">
                {qr ? (
                  <div
                    className="w-48 max-w-full [&_svg]:h-auto [&_svg]:w-full"
                    // El SVG proviene de nuestra propia matriz de módulos
                    // booleanos, sin texto ni datos de usuario embebidos.
                    dangerouslySetInnerHTML={{ __html: qr.toSvgString() }}
                  />
                ) : (
                  <div
                    className="bg-muted aspect-square w-48 max-w-full animate-pulse rounded-md"
                    aria-hidden
                  />
                )}
                {qr && <QrDetails qr={qr} />}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={!qr}
                    onClick={() => {
                      if (!qr) return
                      downloadBlob(
                        new Blob([qr.toSvgString()], {
                          type: 'image/svg+xml',
                        }),
                        'shortedd-qr.svg',
                      )
                    }}
                  >
                    <Download className="size-3.5" />
                    SVG
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={!qr}
                    onClick={async () => {
                      if (!qr) return
                      const blob = await qr.toPngBlob(PNG_DOWNLOAD_SIZE_PX)
                      downloadBlob(blob, 'shortedd-qr.png')
                    }}
                  >
                    <Download className="size-3.5" />
                    PNG
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
