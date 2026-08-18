import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UrlInputProps {
  onSubmit: (input: string) => void
  error: string | null
}

export function UrlInput({ onSubmit, error }: UrlInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (value.trim().length === 0) return
    onSubmit(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <div className="border-input has-[input[aria-invalid]]:border-destructive has-[input[aria-invalid]]:ring-destructive/20 has-focus-visible:border-ring has-focus-visible:ring-ring/50 flex flex-col gap-1.5 rounded-xl border bg-transparent p-1.5 shadow-sm transition-[color,box-shadow] has-focus-visible:ring-3 sm:flex-row sm:gap-0">
        <Input
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Pega o escribe una URL, p. ej. https://ejemplo.com/pagina"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'url-input-error' : undefined}
          className="h-11 flex-1 border-0 bg-transparent px-3 font-mono text-base tracking-tight shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <Button type="submit" size="lg" className="h-11 gap-1.5 px-6">
          Generar
          <ArrowRight className="size-4" />
        </Button>
      </div>
      {error && (
        <p
          id="url-input-error"
          role="alert"
          className="text-destructive text-sm"
        >
          {error}
        </p>
      )}
    </form>
  )
}
