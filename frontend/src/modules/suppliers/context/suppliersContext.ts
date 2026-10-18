import { createContext } from 'react'
import type { Supplier } from '../types'

export type SuppliersContextValue = {
  suppliers: Supplier[]
  addSupplier: (supplier: Supplier) => void
  updateSupplier: (supplier: Supplier) => void
}

export const SuppliersContext = createContext<SuppliersContextValue | null>(null)
