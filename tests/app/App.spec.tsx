import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { Toaster } from '@/components/ui/sonner'

function renderApp() {
  return render(
    <ThemeProvider attribute="class" enableSystem>
      <App />
      <Toaster />
    </ThemeProvider>,
  )
}

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates a web link for a valid URL and shows it copyable', async () => {
    const user = userEvent.setup()
    renderApp()

    const input = screen.getByPlaceholderText(/pega o escribe una url/i)
    await user.type(input, 'https://example.com/hello')
    await user.click(screen.getByRole('button', { name: /generar/i }))

    await waitFor(() => {
      expect(screen.getByText(/#v1\./)).toBeInTheDocument()
    })
  })

  it('shows an inline error for an invalid URL and never crashes', async () => {
    const user = userEvent.setup()
    renderApp()

    const input = screen.getByPlaceholderText(/pega o escribe una url/i)
    await user.type(input, 'javascript:alert(1)')
    await user.click(screen.getByRole('button', { name: /generar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /esquema no permitido/i,
    )
    expect(screen.queryByText(/#v1\./)).not.toBeInTheDocument()
  })

  it('strips tracking params and shows a non-blocking toast', async () => {
    const user = userEvent.setup()
    renderApp()

    const input = screen.getByPlaceholderText(/pega o escribe una url/i)
    await user.type(input, 'https://example.com/a?utm_source=x&id=1')
    await user.click(screen.getByRole('button', { name: /generar/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/parámetro.*de seguimiento eliminado/i),
      ).toBeInTheDocument()
    })
  })

  it('offers a copy button once the link is generated', async () => {
    const user = userEvent.setup()
    renderApp()

    const input = screen.getByPlaceholderText(/pega o escribe una url/i)
    await user.type(input, 'https://github.com/anthropics/claude-code')
    await user.click(screen.getByRole('button', { name: /generar/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copiar/i })).toBeEnabled()
    })
  })
})
