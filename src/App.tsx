import { useState } from 'react'
import { AboutDialog } from '@/app/components/AboutDialog'
import { ResultPanel } from '@/app/components/ResultPanel'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { notifyTrackingParamsRemoved } from '@/app/components/TrackingToast'
import { UrlInput } from '@/app/components/UrlInput'
import { useLocalPreferences } from '@/app/hooks/useLocalPreferences'
import type { GenerationResult } from '@/app/lib/generate'
import { generateLinks } from '@/app/lib/generate'
import { NormalizeError, normalizeUrlWithDetails } from '@/codec/v1/normalize'

function App() {
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { preferences, updatePreferences } = useLocalPreferences()

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
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-medium tracking-tight">Shortedd</span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center gap-8 px-6 py-8">
        <div className="flex w-full max-w-xl flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Enlaces privados, sin servidor
          </h1>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base">
            El destino viaja dentro del propio enlace. Sin cuentas, sin base de
            datos, sin analítica de terceros.
          </p>
        </div>

        <div className="flex w-full max-w-xl flex-col gap-4">
          <UrlInput onSubmit={handleSubmit} error={error} />
          {result && (
            <ResultPanel
              result={result}
              preferences={preferences}
              onPreferencesChange={updatePreferences}
            />
          )}
        </div>
      </main>

      <footer className="text-muted-foreground flex items-center justify-center gap-4 px-6 py-6 text-xs">
        <span>Código abierto</span>
        <AboutDialog />
      </footer>
    </div>
  )
}

export default App
