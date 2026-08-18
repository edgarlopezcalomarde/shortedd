import { useState } from 'react'
import { ResultPanel } from '@/app/components/ResultPanel'
import { notifyTrackingParamsRemoved } from '@/app/components/TrackingToast'
import { UrlInput } from '@/app/components/UrlInput'
import type { GenerationResult } from '@/app/lib/generate'
import { generateLinks } from '@/app/lib/generate'
import { NormalizeError, normalizeUrlWithDetails } from '@/codec/v1/normalize'

function App() {
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(input: string) {
    try {
      const details = normalizeUrlWithDetails(input)
      const generated = generateLinks(
        details.url,
        window.location.origin,
        import.meta.env.BASE_URL,
      )
      setResult(generated)
      setError(null)
      notifyTrackingParamsRemoved(details.removedTrackingParams)
    } catch (err) {
      setResult(null)
      setError(
        err instanceof NormalizeError
          ? err.message
          : 'No se pudo generar el enlace.',
      )
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-lg flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Enlaces privados, sin servidor
          </h1>
          <p className="text-muted-foreground max-w-md text-sm text-balance sm:text-base">
            El destino viaja dentro del propio enlace. Sin cuentas, sin base
            de datos, sin analítica de terceros.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <UrlInput onSubmit={handleSubmit} error={error} />
          {result && <ResultPanel result={result} />}
        </div>
      </div>
    </main>
  )
}

export default App
