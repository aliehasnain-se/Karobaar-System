import { ReactNode, useState } from 'react'
import { initialCustomers } from '../data/mockCustomers'
import type { Customer } from '../types'
import { CustomersContext } from './customersContext'

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)

  const addCustomer = (customer: Customer) => {
    setCustomers((current) => [customer, ...current])
  }

  const updateCustomer = (customer: Customer) => {
    setCustomers((current) => current.map((item) => item.id === customer.id ? customer : item))
  }

  return <CustomersContext.Provider value={{ customers, addCustomer, updateCustomer }}>{children}</CustomersContext.Provider>
}
