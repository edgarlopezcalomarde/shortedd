import type { QrEncodeResult } from '@/qr/types'

function scannability(version: number): { label: string; className: string } {
  if (version <= 10) {
    return { label: 'Buena', className: 'text-green-600 dark:text-green-400' }
  }
  if (version <= 20) {
    return {
      label: 'Moderada',
      className: 'text-amber-600 dark:text-amber-400',
    }
  }
  return { label: 'Precaución', className: 'text-destructive' }
}

interface QrDetailsProps {
  qr: QrEncodeResult
}

export function QrDetails({ qr }: QrDetailsProps) {
  const scan = scannability(qr.version)
  return (
    <p className="text-muted-foreground text-xs">
      QR versión {qr.version} · {qr.moduleCount}×{qr.moduleCount} módulos · ECC{' '}
      {qr.errorCorrectionLevel} · escaneabilidad estimada:{' '}
      <span className={scan.className}>{scan.label}</span>
    </p>
  )
}
