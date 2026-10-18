import { createContext } from 'react'
import type { Customer } from '../types'

export type CustomersContextValue = {
  customers: Customer[]
  addCustomer: (customer: Customer) => void
  updateCustomer: (customer: Customer) => void
}

export const CustomersContext = createContext<CustomersContextValue | null>(null)
