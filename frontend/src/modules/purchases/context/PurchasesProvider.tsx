import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { cancelPurchase as cancelPurchaseRequest, createPurchase, getPurchases } from '../api/purchasesApi'
import type { Purchase, PurchaseInput } from '../types'
import { PurchasesContext } from './purchasesContext'

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      setPurchases(await getPurchases())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load purchases.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const loadTimer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(loadTimer)
  }, [refresh, user])

  const addPurchase = async (input: PurchaseInput) => {
    const purchase = await createPurchase(input)
    setPurchases((current) => [purchase, ...current])
    return purchase
  }

  const cancelPurchase = async (number: string) => {
    const purchase = await cancelPurchaseRequest(number)
    setPurchases((current) => current.map((item) => item.number === number ? purchase : item))
    return purchase
  }

  return (
    <PurchasesContext.Provider value={{ purchases, loading, error, refresh, addPurchase, cancelPurchase }}>
      {children}
    </PurchasesContext.Provider>
  )
}
