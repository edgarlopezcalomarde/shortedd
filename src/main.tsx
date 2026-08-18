import { ThemeProvider } from 'next-themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ConfusableWarning } from './app/components/ConfusableWarning.tsx'
import { ErrorView } from './app/components/ErrorView.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import type { BootstrapDecision } from './routing/bootstrap.ts'
import { runBootstrap } from './routing/bootstrap.ts'

const root = createRoot(document.getElementById('root')!)

/** `runBootstrap()` ya disparó `location.replace()` para 'redirect'; aquí sólo se renderiza el resto. */
function render(decision: BootstrapDecision): void {
  if (decision.action === 'redirect') return
  if (decision.action === 'confirm') {
    root.render(
      <StrictMode>
        <ConfusableWarning url={decision.url} reason={decision.reason} />
      </StrictMode>,
    )
    return
  }
  if (decision.action === 'error') {
    root.render(
      <StrictMode>
        <ErrorView reason={decision.reason} />
      </StrictMode>,
    )
    return
  }
  root.render(
    <StrictMode>
      <ThemeProvider attribute="class" enableSystem>
        <App />
        <Toaster />
      </ThemeProvider>
    </StrictMode>,
  )
}

render(runBootstrap())

// Un cambio de sólo el fragmento (`#v1...`) en una pestaña ya cargada es una
// navegación "same-document": este módulo no se vuelve a ejecutar, así que
// sin este listener un enlace #v1... confuso/erróneo abierto sobre una
// pestaña de Shortedd ya cargada nunca se decodificaría. Los enlaces
// `/q/<payload>` no lo necesitan: un cambio de pathname siempre implica una
// navegación completa.
window.addEventListener('hashchange', () => {
  render(runBootstrap())
})
