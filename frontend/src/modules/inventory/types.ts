export type RollStatusCode = 'AVAILABLE' | 'SOLD' | 'RETURNED' | 'DAMAGED'
export type RollStatus = 'Available' | 'Sold' | 'Returned' | 'Damaged'

export type Fabric = {
  id: number
  name: string
  article: string
  category: string
  brand: string
  colors: number
  rolls: number
  totalMeters: number
}

export type FabricInput = {
  name: string
  article: string
  category: string
  brand: string
}

export type FabricRoll = {
  id: number
  barcode: string
  rollNumber: string
  fabricId: number
  fabric: string
  article: string
  brand: string
  color: string
  originalMeters: number
  remainingMeters: number
  costTotal: number
  price: number
  statusCode: RollStatusCode
  status: RollStatus
  purchaseItemId: number | null
  purchaseNumber: string
  supplier: string
  createdAt: string
}

export type OpeningStockInput = {
  fabricId?: number
  fabricName?: string
  article?: string
  category?: string
  brand?: string
  color: string
  meters: number
  purchaseCost: number
  price: number
  rollNumber?: string
}

export type SellingPriceInput = {
  purchaseItemId: number | null
  rollId: number
  price: number
}
