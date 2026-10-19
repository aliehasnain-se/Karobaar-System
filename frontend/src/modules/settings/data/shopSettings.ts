import type { ShopSettings } from '../types'

const storageKey = 'karobaar-shop-settings'
export const settingsUpdatedEvent = 'karobaar-settings-updated'

export const defaultShopSettings: ShopSettings = {
  shopName: 'Your Shop',
  ownerName: '',
  phone: '',
  city: '',
  address: '',
}

export const getShopSettings = (): ShopSettings => {
  if (typeof window === 'undefined') return defaultShopSettings
  try {
    const saved = window.localStorage.getItem(storageKey)
    return saved
      ? { ...defaultShopSettings, ...JSON.parse(saved) }
      : defaultShopSettings
  } catch {
    return defaultShopSettings
  }
}

export const saveShopSettings = (settings: ShopSettings) => {
  window.localStorage.setItem(storageKey, JSON.stringify(settings))
  window.dispatchEvent(new Event(settingsUpdatedEvent))
}
