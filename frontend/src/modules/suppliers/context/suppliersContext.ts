import { createContext } from 'react'
import type { Supplier, SupplierInput, SupplierLedgerEntry, SupplierPaymentInput } from '../types'

export type SuppliersContextValue = {
  suppliers: Supplier[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  addSupplier: (input: SupplierInput) => Promise<Supplier>
  updateSupplier: (id: number, input: SupplierInput) => Promise<Supplier>
  getLedger: (id: number) => Promise<SupplierLedgerEntry[]>
  recordPayment: (id: number, input: SupplierPaymentInput) => Promise<void>
}

export const SuppliersContext = createContext<SuppliersContextValue | null>(
  null,
)
