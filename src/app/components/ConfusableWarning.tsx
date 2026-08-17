interface ConfusableWarningProps {
  url: string
  reason: string
}

/**
 * Única pantalla intermedia de toda la app: sólo aparece cuando el hostname
 * destino activa la heurística de dominio confuso/homógrafo (ver
 * `security/confusables.ts`). El resto de enlaces redirigen al instante.
 */
export function ConfusableWarning({ url, reason }: ConfusableWarningProps) {
  const hostname = new URL(url).hostname

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-medium">Comprueba este destino</h1>
      <p className="text-muted-foreground max-w-sm text-sm">{reason}</p>
      <p className="max-w-sm rounded-md border px-3 py-2 font-mono text-sm break-all">
        {hostname}
      </p>
      <div className="flex gap-3">
        <a
          href="/"
          className="text-muted-foreground text-sm underline underline-offset-4"
        >
          Cancelar
        </a>
        <button
          type="button"
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
          onClick={() => window.location.replace(url)}
        >
          Continuar de todos modos
        </button>
      </div>
    </main>
  )
}
