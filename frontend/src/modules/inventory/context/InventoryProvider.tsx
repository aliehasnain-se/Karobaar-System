import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { createFabric, createOpeningStock, getFabrics, getRolls, updateSellingPrice } from '../api/inventoryApi'
import type { Fabric, FabricInput, FabricRoll, OpeningStockInput, SellingPriceInput } from '../types'
import { InventoryContext } from './inventoryContext'

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [rolls, setRolls] = useState<FabricRoll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [nextFabrics, nextRolls] = await Promise.all([
        getFabrics(),
        getRolls(),
      ])
      setFabrics(nextFabrics)
      setRolls(nextRolls)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load inventory.',
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const loadTimer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(loadTimer)
  }, [refresh, user])

  const addOpeningStock = async (input: OpeningStockInput) => {
    const roll = await createOpeningStock(input)
    await refresh()
    return roll
  }

  const addFabric = async (input: FabricInput) => {
    const fabric = await createFabric(input)
    setFabrics((current) => [...current, fabric].sort((a, b) => a.name.localeCompare(b.name)))
    return fabric
  }

  const setSellingPrice = async (input: SellingPriceInput) => {
    await updateSellingPrice(input)
    await refresh()
  }

  return (
    <InventoryContext.Provider
      value={{ fabrics, rolls, loading, error, refresh, addFabric, addOpeningStock, setSellingPrice }}
    >
      {children}
    </InventoryContext.Provider>
  )
}
