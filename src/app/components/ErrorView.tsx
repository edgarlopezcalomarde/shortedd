interface ErrorViewProps {
  reason: string
}

export function ErrorView({ reason }: ErrorViewProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-xl font-medium">Enlace no válido</h1>
      <p className="text-muted-foreground max-w-sm text-sm">{reason}</p>
      <a href="/" className="text-primary text-sm underline underline-offset-4">
        Ir a Shortedd
      </a>
    </main>
  )
}
