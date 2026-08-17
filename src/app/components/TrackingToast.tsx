import { toast } from 'sonner'

/** Notificación no bloqueante tras generar: nunca un gate, sólo información. */
export function notifyTrackingParamsRemoved(count: number): void {
  if (count <= 0) return
  toast.info(
    count === 1
      ? '1 parámetro de seguimiento eliminado'
      : `${count} parámetros de seguimiento eliminados`,
  )
}
