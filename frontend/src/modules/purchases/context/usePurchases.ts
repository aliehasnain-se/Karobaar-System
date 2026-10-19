import { useContext } from 'react'
import { PurchasesContext } from './purchasesContext'

export function usePurchases() {
  const context = useContext(PurchasesContext)
  if (!context) throw new Error('usePurchases must be used inside PurchasesProvider')
  return context
}
