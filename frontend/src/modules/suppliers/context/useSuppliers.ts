import { useContext } from 'react'
import { SuppliersContext } from './suppliersContext'

export function useSuppliers() {
  const context = useContext(SuppliersContext)
  if (!context)
    throw new Error('useSuppliers must be used inside SuppliersProvider')
  return context
}
