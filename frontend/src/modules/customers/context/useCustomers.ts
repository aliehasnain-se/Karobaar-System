import { useContext } from 'react'
import { CustomersContext } from './customersContext'

export function useCustomers() {
  const context = useContext(CustomersContext)
  if (!context)
    throw new Error('useCustomers must be used inside CustomersProvider')
  return context
}
