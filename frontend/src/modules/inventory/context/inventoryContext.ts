import { createContext } from 'react'
import type { Fabric, FabricInput, FabricRoll, OpeningStockInput, SellingPriceInput } from '../types'

export type InventoryContextValue = {
  fabrics: Fabric[]
  rolls: FabricRoll[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  addFabric: (input: FabricInput) => Promise<Fabric>
  addOpeningStock: (input: OpeningStockInput) => Promise<FabricRoll>
  setSellingPrice: (input: SellingPriceInput) => Promise<void>
}

export const InventoryContext = createContext<InventoryContextValue | null>(
  null,
)
