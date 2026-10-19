import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import {
  createSupplier,
  createSupplierPayment,
  editSupplier,
  getSupplierLedger,
  getSuppliers,
} from '../api/suppliersApi'
import type { Supplier, SupplierInput, SupplierPaymentInput } from '../types'
import { SuppliersContext } from './suppliersContext'

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) {
      setSuppliers([])
      setLoading(false)
      return
    }
    setLoading(true)
    setLoading(true)
    setError('')
    try {
      setSuppliers(await getSuppliers())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load suppliers.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const loadTimer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(loadTimer)
  }, [refresh, user])

  const addSupplier = async (input: SupplierInput) => {
    const supplier = await createSupplier(input)
    setSuppliers((current) => [supplier, ...current])
    return supplier
  }

  const updateSupplier = async (id: number, input: SupplierInput) => {
    const supplier = await editSupplier(id, input)
    setSuppliers((current) => current.map((item) => item.id === id ? supplier : item))
    return supplier
  }

  const recordPayment = async (id: number, input: SupplierPaymentInput) => {
    await createSupplierPayment(id, input)
    await refresh()
  }

  return (
    <SuppliersContext.Provider value={{ suppliers, loading, error, refresh, addSupplier, updateSupplier, getLedger: getSupplierLedger, recordPayment }}>
      {children}
    </SuppliersContext.Provider>
  )
}
