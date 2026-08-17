import { useCallback, useEffect, useState } from 'react'
import type { EccLevel } from '@/qr/types'

export interface QrPreferences {
  errorCorrectionLevel: EccLevel
  marginModules: number
}

const DEFAULT_PREFERENCES: QrPreferences = {
  errorCorrectionLevel: 'M',
  marginModules: 4,
}

const STORAGE_KEY = 'shortedd:qr-preferences'

function loadPreferences(): QrPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

/** Preferencias no sensibles (opciones de visualización del QR) persistidas en localStorage. */
export function useLocalPreferences() {
  const [preferences, setPreferences] = useState<QrPreferences>(loadPreferences)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const updatePreferences = useCallback((patch: Partial<QrPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }))
  }, [])

  return { preferences, updatePreferences }
}
