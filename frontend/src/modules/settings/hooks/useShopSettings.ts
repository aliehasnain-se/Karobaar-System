import { useEffect, useState } from 'react'
import { getShopSettings, settingsUpdatedEvent } from '../data/shopSettings'

export function useShopSettings() {
  const [settings, setSettings] = useState(getShopSettings)

  useEffect(() => {
    const syncSettings = () => setSettings(getShopSettings())
    window.addEventListener('storage', syncSettings)
    window.addEventListener(settingsUpdatedEvent, syncSettings)
    return () => {
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener(settingsUpdatedEvent, syncSettings)
    }
  }, [])

  return settings
}
