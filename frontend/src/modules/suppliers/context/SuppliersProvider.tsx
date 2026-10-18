import { ReactNode, useState } from 'react'
import { initialSuppliers } from '../data/mockSuppliers'
import type { Supplier } from '../types'
import { SuppliersContext } from './suppliersContext'

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)

  const addSupplier = (supplier: Supplier) => setSuppliers((current) => [supplier, ...current])
  const updateSupplier = (supplier: Supplier) => setSuppliers((current) => current.map((item) => item.id === supplier.id ? supplier : item))

  return <SuppliersContext.Provider value={{ suppliers, addSupplier, updateSupplier }}>{children}</SuppliersContext.Provider>
}
