export type RollStatus = 'Available' | 'Low stock' | 'In transit'

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

export type FabricRoll = {
  id: number
  barcode: string
  rollNumber: string
  fabric: string
  article: string
  color: string
  originalMeters: number
  remainingMeters: number
  status: RollStatus
}

