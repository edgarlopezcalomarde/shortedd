import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { QrPreferences } from '@/app/hooks/useLocalPreferences'
import type { EccLevel } from '@/qr/types'

const ECC_OPTIONS: { value: EccLevel; label: string }[] = [
  { value: 'L', label: 'L — hasta 7% de recuperación' },
  { value: 'M', label: 'M — hasta 15% de recuperación' },
  { value: 'Q', label: 'Q — hasta 25% de recuperación' },
  { value: 'H', label: 'H — hasta 30% de recuperación' },
]

const MARGIN_OPTIONS = [2, 4, 6, 8]

interface QrOptionsSheetProps {
  preferences: QrPreferences
  onChange: (patch: Partial<QrPreferences>) => void
}

export function QrOptionsSheet({ preferences, onChange }: QrOptionsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="size-3.5" />
          Opciones
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Opciones de QR</SheetTitle>
          <SheetDescription>
            Ajusta la corrección de errores y el margen del código QR.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Corrección de errores</span>
            <Select
              value={preferences.errorCorrectionLevel}
              onValueChange={(value) =>
                onChange({ errorCorrectionLevel: value as EccLevel })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ECC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Margen (módulos)</span>
            <Select
              value={String(preferences.marginModules)}
              onValueChange={(value) =>
                onChange({ marginModules: Number(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARGIN_OPTIONS.map((margin) => (
                  <SelectItem key={margin} value={String(margin)}>
                    {margin} módulos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
