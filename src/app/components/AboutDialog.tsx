import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="hover:text-foreground underline underline-offset-4"
        >
          Cómo funciona
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shortedd no es un acortador gestionado</DialogTitle>
          <DialogDescription asChild>
            <div className="text-muted-foreground flex flex-col gap-3 text-sm">
              <p>
                No hay cuentas, base de datos ni servidor: el destino viaja
                codificado dentro del propio enlace. Tu navegador lo decodifica
                y redirige localmente.
              </p>
              <p>Por eso, a diferencia de un acortador gestionado:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>No hay alias personalizados ni enlaces editables.</li>
                <li>Los enlaces no caducan ni se pueden revocar.</li>
                <li>
                  No hay estadísticas de clics ni analítica de ningún tipo.
                </li>
              </ul>
              <p>
                Los parámetros de seguimiento habituales (utm_*, fbclid, gclid…)
                se eliminan siempre al generar el enlace.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
