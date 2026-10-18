import type { ShopSettings } from '../types'

const storageKey = 'karobaar-shop-settings'
export const settingsUpdatedEvent = 'karobaar-settings-updated'

export const defaultShopSettings: ShopSettings = {
  shopName: 'Karobaar',
  ownerName: 'Ali Hasnain',
  phone: '0300 1234567',
  city: 'Lahore',
  address: 'Main Cloth Market',
}

export const getShopSettings = (): ShopSettings => {
  if (typeof window === 'undefined') return defaultShopSettings
  try {
    const saved = window.localStorage.getItem(storageKey)
    return saved ? { ...defaultShopSettings, ...JSON.parse(saved) } : defaultShopSettings
  } catch {
    return defaultShopSettings
  }
}

export const saveShopSettings = (settings: ShopSettings) => {
  window.localStorage.setItem(storageKey, JSON.stringify(settings))
  window.dispatchEvent(new Event(settingsUpdatedEvent))
}
