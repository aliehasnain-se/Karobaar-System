import { createContext } from 'react'
import type { Purchase, PurchaseInput } from '../types'

export type PurchasesContextValue = {
  purchases: Purchase[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  addPurchase: (input: PurchaseInput) => Promise<Purchase>
  cancelPurchase: (number: string) => Promise<Purchase>
}

export const PurchasesContext = createContext<PurchasesContextValue | null>(null)
