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
      <div className="flex flex-col gap-2 sm:flex-row">
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
          className="h-12 flex-1 text-base"
        />
        <Button type="submit" size="lg" className="h-12 gap-1.5 px-6">
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
